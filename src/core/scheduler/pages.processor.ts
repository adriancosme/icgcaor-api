import { OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import puppeteer from 'puppeteer';
import { ProductsService } from '../../modules/products/services/products.service';
import { IPage } from '../../common/interfaces/page.interface';
import { CreateProductDto } from '../../modules/products/dtos/create-product.dto';
import { join } from 'path';
import { Promotion } from 'src/modules/products/schemas/promotion.schema';
@Processor('pages-queue')
export class PagesProcessor {
  constructor(public productsService: ProductsService) { }
  private readonly logger = new Logger(PagesProcessor.name);
  @Process('extract')
  async extract(job: Job<IPage>) {
    try {
      const regexSurtimex = new RegExp('surtimex.com')
      const regexIndar = new RegExp('indar.mx')
      if (regexSurtimex.test(job.data.url)) {
        this.logger.log(`processing surtimex ${job.data.name}`);
        await this.extractDataSurtimex(job.data);
        return job.data;
      }
      if (regexIndar.test(job.data.url)) {
        this.logger.log(`processing indar ${job.data.name}`);
        await this.extractDataIndar(job.data);
        return job.data;
      }
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

  async extractDataIndar({ name: pageName, url }: IPage) {
    const startTime = performance.now();
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.indar.mx/', {
      waitUntil: 'networkidle2', timeout: 60000
    });
    await page.evaluate(() => {
      const buttonOpenModalLogin = document.querySelector<HTMLHeadingElement>('.login-options > div > h5[onclick="activeModal(1)"]');
      buttonOpenModalLogin?.click();
    });
    await page.waitForSelector('#login-modal');
    await page.type('#login-modal > form #email', 'ferre_motos@hotmail.com');
    await page.type('#login-modal > form #password', '87juanro');
    await Promise.all([
      await page.evaluate(() => {
        const LoginBtn = document.querySelector<HTMLAnchorElement>('#login-modal > form > .login-buttons > button.btn.login-btn[type="submit"]');
        LoginBtn?.click();
      }),
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
    ]);
    await this.delay(1000);
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
      page.goto(url, {
        waitUntil: 'networkidle2',
      }),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
    ]);
    await this.delay(20000);
    await page.screenshot({ path: join(process.cwd(), '/temp', 'screenshot.png') });
    const hasPagination = await page.evaluate(() => {
      const liItems = document.querySelectorAll('#paginationUl li');
      return liItems.length;
    });
    let isLastPage = false;
    await page.screenshot({ path: join(process.cwd(), '/temp', 'screenshot2.png') });
    while (!isLastPage) {
      let hasProducts = await page.evaluate(() => {
        const products = document.querySelectorAll('#productList > div > div > div.itemInfo > h5');
        return products.length;
      });
      await page.screenshot({ path: join(process.cwd(), '/temp', 'screenshot3.png') });
      console.log(hasProducts);
      if (!hasProducts) {
        console.log('waiting');
        await this.delay(120000);
        hasProducts = await page.evaluate(() => {
          const products = document.querySelectorAll('#productList > div > div > div.itemInfo > h5');
          return products.length;
        });
      }
      console.log(hasProducts);
      console.log(!hasProducts);
      await page.screenshot({ path: join(process.cwd(), '/temp', 'screenshot4.png') });
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
          waitUntil: 'domcontentloaded', timeout: 60000
        });
        if (res.status() === 500) {
          const res = await newPage.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
          if (res.status() === 500) {
            break;
          }
        }
        await this.delay(1000);
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
          pageUrl: `https://www.indar.mx/portal/detallesProducto/${code}`,
          provider: pageName
        };
        products.push(product);
        await newPage.close();
      }
      this.logger.log(`${products.length} products are going to add or update`);
      const dataInserted = await this.productsService.createBatch(products);
      this.logger.log(`${dataInserted.length} products updated to database`);
      this.logger.log(`${products.length - dataInserted.length} products added to database`);
      if (!hasPagination) {
        break;
      }
      const nextPageIsEnabled = await page.$eval('#paginationUl li:nth-last-child(-n+1)', (el) => !el.classList.contains('disabled'));
      if (!nextPageIsEnabled) {
        isLastPage = true;
      }
      await page.evaluate(() => {
        const nextPageBtn = document.querySelector<HTMLAnchorElement>('#paginationUl li:nth-last-child(-n+1) a');
        nextPageBtn?.click();
      });
    }
    await page.close();
    await browser.close();
    const endTime = performance.now();
    this.logger.log(`Extract products took ${Math.floor(endTime - startTime)} milliseconds`);
  }

  async extractDataSurtimex({ name: pageName, url }: IPage) {
    const startTime = performance.now();
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    // LOGIN
    await page.goto('https://www.surtimex.com/cuenta');
    await page.type('#username', 'CMOR3917');
    await page.type('#password', 'cR&874dFO');
    await page.click('#login-form > button');
    await page.waitForSelector('div.indicator.cerrar-s > a')
    await page.goto('https://www.surtimex.com/buscar-productos-marca/fandeli_49', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#pagination li')
    const hasPagination = await page.$$('#pagination li');
    let isLastPage = false;
    while (!isLastPage) {
      const [names, skus] = await page.evaluate(() => {
        const namesAndSkus = [...document.querySelectorAll('.products-list__item .product-card__name a')];
        const names = namesAndSkus.map((value) => {
          return value.innerHTML.split('<br>')[0]
        })
        const skus = namesAndSkus.map((value) => {
          return value.innerHTML.split('<br>')[1]
        })
        return [names, skus]
      })

      const [discounts] = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('.products-list__item .product-card')];
        const discounts = divs.map((value, index) => {
          if (value.childElementCount === 0) return null
          const hasDiscount = document.querySelector(`div.products-view__list.products-list > div > div:nth-child(${index + 1}) > div > div.product-card__badges-list`)
          if (hasDiscount === null) return null
          return hasDiscount.textContent.trim()
        })

        return [discounts]
      })

      const [productPricesHasChildren, newPrices, oldPrices, productPrices] = await page.evaluate(() => {
        let newPrices = null;
        let oldPrices = null;
        let productPrices = null;
        const prices = [...document.querySelectorAll('.products-list__item .product-card__actions .product-card__prices')];
        const productPricesHasChildren = prices.map((value) => {
          return value.childElementCount
        })
        productPrices = productPricesHasChildren.map((value, index) => {
          if (value === 0) {
            return prices[index].textContent.trim().replace(/[^0-9]/, '')
          }
        })
        newPrices = productPricesHasChildren.map((value, index) => {
          if (value > 0) {
            return prices[index].children[0].textContent.trim().replace(/[^0-9]/, '')
          }
        })
        oldPrices = productPricesHasChildren.map((value, index) => {
          if (value > 0) {
            return prices[index].children[1].textContent.trim().replace(/[^0-9]/, '')
          }
        })
        return [productPricesHasChildren, newPrices, oldPrices, productPrices]
      })

      const productsLinks = await page.evaluate(() => {
        const links = [...document.querySelectorAll<HTMLAnchorElement>('.products-list .product-card__name a')];
        return links.map((value) => value?.href)
      })
      const products = names.map((value, index) => {
        return {
          name: value,
          internalCode: skus[index],
          promotion: discounts[index] != null ? { description: discounts[index] } as Promotion : null,
          priceInList: productPricesHasChildren[index] === 0 ? productPrices[index] : oldPrices[index],
          clientPrice: null,
          suggestPrice: productPricesHasChildren[index] > 0 ? newPrices[index] : null,
          pageUrl: productsLinks[index],
          provider: pageName
        } as unknown as CreateProductDto
      });

      this.logger.log(`${products.length} products are going to add or update`);
      const dataInserted = await this.productsService.createBatch(products);
      this.logger.log(`${dataInserted.length} products updated to database`);
      this.logger.log(`${products.length - dataInserted.length} products added to database`);
      // MANAGE PAGINATION
      if (!hasPagination) {
        break;
      }
      const nextPageIsEnabled = await page.$eval('#pagination li:nth-last-child(-n+2)', (el) => !el.classList.contains('disabled'));
      if (!nextPageIsEnabled) {
        isLastPage = true;
        break;
      }
      await Promise.all([
        page.click('#pagination li:nth-last-child(-n+2) a'),
        page.waitForNavigation()
      ])

    }
    await browser.close();
    const endTime = performance.now();
    this.logger.log(`Extract products took ${Math.floor(endTime - startTime)} milliseconds`);
  }

  @OnQueueActive()
  onActive(job: Job<IPage>) {
    this.logger.debug(`Extracting data from ${job.data.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<IPage>) {
    this.logger.debug(`Job completed. ${job.data.name} Products page has been updated`);
  }

  @OnQueueStalled()
  onStalled(job: Job<IPage>) {
    this.logger.debug(`Job Stalled ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<IPage>) {
    this.logger.debug(`Job Failed ${job.id} Page: ${job.data.name}`);
  }
}
