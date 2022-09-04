import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapperLogsModule } from '../../modules/scrapper-logs/scrapper-logs.module';
import { Page, PageSchema } from '../../modules/pages/schemas/page.schema';
import { ProductsModule } from '../../modules/products/products.module';
import { IndarScrapperService } from './indar-scrapper.service';
import { ProductsProcessor } from './products.processor';
import { TaskService } from './task.service';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'products-queue',
      defaultJobOptions: {
        attempts: 5,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 1000,
      },
    }),
    ProductsModule,
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    ScrapperLogsModule,
  ],
  providers: [TaskService, IndarScrapperService, ProductsProcessor],
})
export class SchedulerModule {}
