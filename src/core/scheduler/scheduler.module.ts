import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Page, PageSchema } from '../../modules/pages/schemas/page.schema';
import { ProductsModule } from '../../modules/products/products.module';
import { ScrapperLogsModule } from '../../modules/scrapper-logs/scrapper-logs.module';
import { ScrapperService } from './scrapper.service';
import { PagesProcessor } from './pages.processor';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'pages-queue',
    }),
    ProductsModule,
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    ScrapperLogsModule,
  ],
  providers: [ScrapperService, PagesProcessor],
})
export class SchedulerModule {}
