import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import puppeteer from 'puppeteer';
import { Page, PageDocument } from '../../modules/pages/schemas/page.schema';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
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
    const browser = await puppeteer.launch();
    const pages = await this.pageModel.find({}).sort({ createdAt: 1 });
    await Promise.all(
      pages.map(async (page) => {
        this.logger.debug(`Getting data from ${page.name} via puppeter!`);
        const products = await this.extractData({ uri: page.url, browser });
        this.scrapperQueue.add('save', products);
        return products;
      }),
    );
    await browser.close();
  }

  async extractData({ uri, browser }) {
    const products = [];
    const page = await browser.newPage();
    await page.goto('http://www.indar.com.mx');

    await page.click('#entrar');
    await page.waitForSelector('#entrarVM', { timeout: 60000 });
    await page.type(`#registracliente input[name="wusuario"]`, 'ferre_motos@hotmail.com');
    await page.type(`#registracliente input[name="wcontrasena"]`, '87JUANRO');
    await page.evaluate((btnSelector) => {
      document.querySelector(btnSelector).click();
    }, '#vm_boton');
    await page.waitForSelector('#usuarioMenu', { timeout: 60000 });
    const url = new URL(uri);
    await page.goto(url.toString());
    const lastPageLink = await page.evaluate(() => {
      const linkToLastPage = document.querySelector<HTMLAnchorElement>('#tabla_posicion_pagina2 > div > a:nth-last-child(-n+1)#tabla_pagina_otras');
      if (!linkToLastPage) {
        return null;
      }
      return linkToLastPage.href;
    });
    const currentPage = await page.evaluate(() => {
      const pageLink = document.querySelector('#tabla_pagina_actual');
      if (!pageLink) {
        return null;
      }
      return pageLink.textContent.trim();
    });
    const lastPage = new URL(lastPageLink);
    for (let index = parseInt(currentPage) - 1; index < parseInt(lastPage.searchParams.get('wpage')); index++) {
      await page.waitForSelector('#i_tbl_art > div:nth-child(1)', {
        timeout: 60000,
      });
      await this.delay(1000);
      const productNames = await page.evaluate(async () => {
        const divs = [...document.querySelectorAll('#i_tbl_art > div:nth-child(1)')];
        return divs.map((div) => {
          return div?.innerHTML.trim().split('<br>')[0].trim();
        });
      });
      const productInternalCodes = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('#i_tbl_art')];
        return divs.map((div, idx) => {
          const bestPriceIcon = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div.tbl_art_des.tbl_art_des4`);
          if (bestPriceIcon) {
            const code = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(3)`);
            return code.innerHTML.trim().split('<br>')[0].trim();
          } else {
            const code = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(2)`);
            return code.innerHTML.trim().split('<br>')[0].trim();
          }
        });
      });

      const productPromotions = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('#i_tbl_art')];

        return Promise.all(
          divs.map(async (div, idx) => {
            function delay(time) {
              return new Promise(function (resolve) {
                setTimeout(resolve, time);
              });
            }
            await delay(1000);
            const bestPriceIcon = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div.tbl_art_des.tbl_art_des4`);
            if (bestPriceIcon) {
              function delay(time) {
                return new Promise(function (resolve) {
                  setTimeout(resolve, time);
                });
              }
              await delay(1000);
              const promotion = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(6)`);
              if (promotion.childNodes[0].textContent.replace(/\n/g, '').trim() === 'Sin promoción') {
                return null;
              } else {
                return {
                  description: `${promotion.childNodes[3].textContent.replace(/\n/g, '').trim()} ${promotion.childNodes[6].textContent
                    .replace(/\n/g, '')
                    .trim()}`,
                  expiration: promotion.childNodes[12].textContent.replace(/[^0-9/]+/g, '').trim(),
                };
              }
            } else {
              function delay(time) {
                return new Promise(function (resolve) {
                  setTimeout(resolve, time);
                });
              }
              await delay(1000);
              const promotion = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(5)`);
              if (promotion.childNodes[0].textContent.replace(/\n/g, '').trim() === 'Sin promoción') {
                return null;
              } else {
                return {
                  description: `${promotion.childNodes[3].textContent.replace(/\n/g, '').trim()} ${promotion.childNodes[6].textContent
                    .replace(/\n/g, '')
                    .trim()}`,
                  expiration: promotion.childNodes[12].textContent.replace(/[^0-9/]+/g, '').trim(),
                };
              }
            }
          }),
        );
      });
      const productPriceList = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('#i_tbl_art')];
        return divs.map((div, idx) => {
          const bestPriceIcon = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div.tbl_art_des.tbl_art_des4`);
          if (bestPriceIcon) {
            const price = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(7) > span:nth-child(2)`);
            if (price.textContent) {
              return price.textContent.replace(/[^0-9.]+/g, '');
            }
          } else {
            const price = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(6) > span:nth-child(2)`);
            if (price.textContent) {
              return price.textContent.replace(/[^0-9.]+/g, '');
            }
          }
        });
      });
      const productPricePPago = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('#i_tbl_art')];
        return divs.map((div, idx) => {
          const bestPriceIcon = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div.tbl_art_des.tbl_art_des4`);
          if (bestPriceIcon) {
            const price = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(8) > div.tbl_art_des3`);
            if (price.textContent) {
              return price.textContent.replace(/[^0-9.]+/g, '');
            }
          } else {
            const price = document.querySelector(`#i_tbl_art:nth-child(${idx + 1}) > div:nth-child(7) > div.tbl_art_des3`);
            if (price.textContent) {
              return price.textContent.replace(/[^0-9.]+/g, '');
            }
          }
        });
      });
      if (
        productNames.length === productInternalCodes.length &&
        productNames.length === productPromotions.length &&
        productNames.length === productPriceList.length &&
        productNames.length === productPricePPago.length
      ) {
        for (let index = 0; index < productNames.length; index++) {
          const product = {
            name: productNames[index],
            internalCode: productInternalCodes[index],
            promotions: productPromotions[index],
            priceInList: productPriceList[index],
            pricePPago: productPricePPago[index],
          };
          products.push(product);
        }
      }
      await page.waitForSelector('#tabla_posicion_pagina2 > div > a:nth-last-child(-n+2)#tabla_pagina_otras', { timeout: 60000 });
      await page.evaluate((btnSelector) => {
        const pageNextButton = document.querySelector(btnSelector);
        pageNextButton.click();
      }, '#tabla_posicion_pagina2 > div > a:nth-last-child(-n+2)#tabla_pagina_otras');
    }
    await page.close();
    return products;
  }
}
