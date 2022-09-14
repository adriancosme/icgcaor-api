import { OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Product } from '../../modules/products/schemas/product.schema';
import { ScrapperLogsService } from '../../modules/scrapper-logs/services/scrapper-logs.service';
import { ProductsService } from '../../modules/products/services/products.service';
import { CreateProductDto } from 'src/modules/products/dtos/create-product.dto';
@Processor('products-queue')
export class ProductsProcessor {
  constructor(public service: ProductsService, public logsService: ScrapperLogsService) {}
  private readonly logger = new Logger(ProductsProcessor.name);
  @Process('save')
  async save(job: Job<CreateProductDto[]>) {
    const products = await this.service.createBatch(job.data);
    await this.logsService.create(products.length);
    return job.data;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name} `);
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
