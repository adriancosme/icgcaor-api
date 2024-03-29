import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { ScrapperLogs, ScrapperLogsSchema } from './schemas/scrapper-logs.schema';
import { ScrapperLogsController } from './scrapper-logs.controller';
import { ScrapperLogsService } from './services/scrapper-logs.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ScrapperLogs.name, schema: ScrapperLogsSchema }]), ProductsModule],
  providers: [ScrapperLogsService],
  exports: [ScrapperLogsService],
  controllers: [ScrapperLogsController],
})
export class ScrapperLogsModule {}
