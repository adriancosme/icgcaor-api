import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapperLogs, ScrapperLogsDocument } from '../schemas/scrapper-logs.schema';

@Injectable()
export class ScrapperLogsService {
  constructor(@InjectModel(ScrapperLogs.name) private readonly scrapperLogsModel: Model<ScrapperLogsDocument>) {}
  /**
   * Get last update of web scrapper
   */
  async getLastUpdate() {
    const log = await this.scrapperLogsModel.findOne({}).sort({ createdAt: -1 });
    return log.toObject();
  }
}
