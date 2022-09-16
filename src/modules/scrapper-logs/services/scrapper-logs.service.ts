import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../../../modules/products/services/products.service';
import { ScrapperLogs, ScrapperLogsDocument } from '../schemas/scrapper-logs.schema';

@Injectable()
export class ScrapperLogsService {
  constructor(@InjectModel(ScrapperLogs.name) private readonly scrapperLogsModel: Model<ScrapperLogsDocument>) {}

  @Inject(ProductsService)
  private readonly productsService: ProductsService;
  /**
   * Get last update of web scrapper
   */
  async getLastUpdate() {
    return await this.productsService.getLastUpdateFromProduct();
  }

  /**
   * Create log on update or add product
   * @param products - Count of products inserted
   */
  async create(products: number) {
    const log = new this.scrapperLogsModel({ productsImported: products });
    await log.save();
    return log?.toObject();
  }
}
