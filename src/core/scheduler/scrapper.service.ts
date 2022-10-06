import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { getRandomInt } from '../../common/utils/dates.util';
import { Page, PageDocument } from '../../modules/pages/schemas/page.schema';

@Injectable()
export class ScrapperService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>, @InjectQueue('pages-queue') private queue: Queue) { }
  private readonly logger = new Logger(ScrapperService.name);

  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: 'America/Mexico_City' })
  async getDataViaPuppeter() {
    const pages = await this.pageModel.find({}).sort({ createdAt: 1 });
    pages.map(async (page) => {
      const randomMinutes = getRandomInt(1, 1);
      const delayMs = randomMinutes * 60000;
      this.logger.debug(`${page.name} adding to queue and it will execute on ${delayMs} miliseconds`);
      await this.queue.add('extract', page, { attempts: 5, removeOnComplete: true, removeOnFail: true, backoff: 2000, delay: delayMs });
    });
  }
}
