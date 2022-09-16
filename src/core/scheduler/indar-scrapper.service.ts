import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { randomDate } from '../../common/utils/dates.util';
import { Page, PageDocument } from '../../modules/pages/schemas/page.schema';

@Injectable()
export class IndarScrapperService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>, @InjectQueue('pages-queue') private queue: Queue) {}
  private readonly logger = new Logger(IndarScrapperService.name);

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async getDataViaPuppeter() {
    const random = randomDate(1, 5);
    const hoursMs = random.getHours() * 60 * 60 * 1000;
    const minutesMs = random.getMinutes() * 60 * 1000;
    const time = hoursMs + minutesMs;
    const delay = time - new Date().getMilliseconds();
    const pages = await this.pageModel.find({}).sort({ createdAt: 1 });
    pages.map(async (page) => {
      this.logger.debug(`${page.name} adding to queue`);
      await this.queue.add('extract', page, { attempts: 5, removeOnComplete: true, removeOnFail: true, backoff: 2000, delay: delay });
    });
  }
}
