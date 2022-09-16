import { OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { ProductsService } from '../../modules/products/services/products.service';
import { IPage } from '../../common/interfaces/page.interface';
import { CreateProductDto } from '../../modules/products/dtos/create-product.dto';
@Processor('pages-queue')
export class PagesProcessor {
  constructor(public productsService: ProductsService) {}
  private readonly logger = new Logger(PagesProcessor.name);
  @Process('extract')
  async extract(job: Job<IPage>) {
    this.logger.log(`processing ${job.data.name}`);
    try {
      await this.extractData({ uri: job.data.url });
      return job.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  delay(time: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async extractData({ uri }) {
    
    const startTime = performance.now();
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.indar.mx/', {
      waitUntil: 'domcontentloaded',
    });
    await page.evaluate(() => {
      const buttonOpenModalLogin = document.querySelector<HTMLHeadingElement>('.login-options > div > h5[onclick="activeModal(1)"]');
      buttonOpenModalLogin.click();
    });
    await page.waitForSelector('#login-modal');
    await page.type('#login-modal > form #email', 'ferre_motos@hotmail.com');
    await page.type('#login-modal > form #password', '87juanro');
    await Promise.all([
      await page.evaluate(() => {
        const LoginBtn = document.querySelector<HTMLAnchorElement>('#login-modal > form > .login-buttons > button.btn.login-btn[type="submit"]');
        LoginBtn.click();
      }),
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);
    this.delay(1000);
    const isLoggedIn = await page.evaluate(() => {
      const iconosCuenta = document.querySelectorAll('.iconos-cuenta.row');
      if (iconosCuenta.length > 0) return true;
    });
    if (!isLoggedIn) {
      console.error('There are some problems trying to authenticate');
      await browser.close();
    }

    // GO TO PAGE AND GET COD PRODUCTS OF EVERY PAGE
    await Promise.all([
      page.goto(uri, {
        waitUntil: 'domcontentloaded',
      }),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);
    this.delay(20000);
    const hasPagination = await page.evaluate(() => {
      const liItems = document.querySelectorAll('#paginationUl li');
      return liItems.length;
    });
    let isLastPage = false;
    while (!isLastPage) {
      const hasProducts = await page.$$eval('#productList > div > div > div.itemInfo > h5', (el) => el.length > 0);
      if (!hasProducts) {
        break;
      }
      const codes = await page.evaluate(() => {
        const productsDescription = [...document.querySelectorAll('#productList > div > div > div.itemInfo > h5')];
        return productsDescription.map((value) => {
          return value.textContent.split(' - ')[0].toString().trim();
        });
      });
      const products: CreateProductDto[] = [];
      for (const code of codes) {
        const newPage = await browser.newPage();

        const res = await newPage.goto(`https://www.indar.mx/portal/detallesProducto/${code}`, {
          waitUntil: 'domcontentloaded',
        });
        if (res.status() === 500) {
          const res = await newPage.reload({ waitUntil: 'domcontentloaded' });
          if (res.status() === 500) {
            break;
          }
        }
        const productName = await newPage.evaluate(() => {
          const name = document.querySelector('h5.purchasedescription')?.textContent;
          return name;
        });
        const productCode = await newPage.evaluate(() => {
          return document.querySelector('div.container-fluid.container-detallesProducto h4.itemid')?.textContent;
        });
        const priceInList = await newPage.evaluate(() => {
          return document.querySelector('span#precioLista')?.textContent ?? null;
        });
        const clientPrice = await newPage.evaluate(() => {
          const price = document.querySelector(
            'div.container-fluid.container-detallesProducto > div > div.container-info.col-lg-6.col-12 > div > div:nth-child(3) > div > div:nth-child(2) > div > h5:nth-child(3) > span.text-blue',
          )?.textContent;
          if (!price) {
            return null;
          }
          return price.replace(/[^0-9.]+/g, '');
        });
        const suggestPrice = await newPage.evaluate(() => {
          const price = document.querySelector(
            'div.container-fluid.container-detallesProducto > div > div.container-info.col-lg-6.col-12 > div > div:nth-child(3) > div > div:nth-child(2) > div > h5:nth-child(4) > span',
          )?.textContent;
          if (!price) {
            return null;
          }
          return price.replace(/[^0-9.]+/g, '');
        });
        const productPromotion = await newPage.evaluate(() => {
          const discount = document.querySelector('div.promosContainer h5.infoItem span')?.textContent;
          const promotionDescription = document.querySelector(
            'div.container-fluid.container-detallesProducto > div > div.container-info.col-lg-6.col-12 > div > div:nth-child(4) > div > div:nth-child(1) > h5:nth-child(2) > span',
          )?.textContent;
          if (discount && promotionDescription) {
            return {
              description: `${discount} ${promotionDescription}`,
            };
          }
          return null;
        });
        const product: CreateProductDto = {
          name: productName,
          internalCode: productCode,
          promotion: productPromotion,
          priceInList: priceInList,
          clientPrice: clientPrice,
          suggestPrice: suggestPrice,
        };
        products.push(product);
        await newPage.close();
      }
      const dataInserted = await this.productsService.createBatch(products);
      this.logger.log(`${dataInserted.length} products added or updated to database`);
      if (!hasPagination) {
        break;
      }
      const nextPageIsEnabled = await page.$eval('#paginationUl li:nth-last-child(-n+1)', (el) => !el.classList.contains('disabled'));
      if (!nextPageIsEnabled) {
        isLastPage = true;
      }
      await page.evaluate(() => {
        const nextPageBtn = document.querySelector<HTMLAnchorElement>('#paginationUl li:nth-last-child(-n+1) a');
        nextPageBtn.click();
      });
    }
    await page.close();
    await browser.close();
    const endTime = performance.now();
    this.logger.log(`Extract products took ${Math.floor(endTime - startTime)} milliseconds`);
  }

  @OnQueueActive()
  onActive(job: Job<IPage>) {
    this.logger.debug(`Extracting data from ${job.data.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Job completed ${job.id} of type ${job.name}`);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    this.logger.debug(`Job Stalled ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    this.logger.debug(`Job Failed ${job.id} of type ${job.name}`);
  }
}
