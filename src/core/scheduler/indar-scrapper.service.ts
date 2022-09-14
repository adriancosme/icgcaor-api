import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import puppeteer from 'puppeteer';
import { Page, PageDocument } from '../../modules/pages/schemas/page.schema';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Product } from '../../modules/products/schemas/product.schema';
import { IProduct } from '../../common/interfaces';
import { CreateProductDto } from 'src/modules/products/dtos/create-product.dto';
@Injectable()
export class IndarScrapperService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>, @InjectQueue('products-queue') private scrapperQueue: Queue) {}
  private readonly logger = new Logger(IndarScrapperService.name);
  delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async getDataViaPuppeter() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const pages = await this.pageModel.find({}).sort({ createdAt: 1 });
    await Promise.all(
      pages.map(async (page) => {
        this.logger.debug(`Getting data from ${page.name} via puppeter!`);
        const products = await this.extractData({ uri: page.url, browser });
        console.log(products.length);        
        const job = await this.scrapperQueue.add('save', products);
        console.log('Job added', job);
        return products;
      }),
    );
    await browser.close();
  }

  async extractData({ uri, browser }) {
    const products: CreateProductDto[] = [];
    const page = await browser.newPage();
    await page.goto('https://www.indar.mx/', {
      waitUntil: 'networkidle2',
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
      await page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
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
        waitUntil: 'networkidle2',
      }),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);
    const hasPagination = await page.evaluate(() => {
      const liItems = document.querySelectorAll('#paginationUl li');
      return liItems.length;
    });
    let isLastPage = false;
    while (!isLastPage) {
      await page.waitForSelector('#productList > div > div > div.itemInfo > h5');
      const codes = await page.evaluate(() => {
        const productsDescription = [...document.querySelectorAll('#productList > div > div > div.itemInfo > h5')];
        return productsDescription.map((value) => {
          return value.textContent.split(' - ')[0].toString().trim();
        });
      });
      for (const code of codes) {
        const newPage = await browser.newPage();

        const res = await newPage.goto(`https://www.indar.mx/portal/detallesProducto/${code}`, {
          waitUntil: 'networkidle2',
        });
        if (res.status() === 500) {
          const res = await newPage.reload({ waitUntil: 'networkidle2' });
          if (res.status() === 500) {
            break;
          }
        }
        this.delay(1000);
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
    return products;
  }
}
