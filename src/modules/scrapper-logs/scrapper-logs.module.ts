import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapperLogs, ScrapperLogsSchema } from './schemas/scrapper-logs.schema';
import { ScrapperLogsController } from './scrapper-logs.controller';
import { ScrapperLogsService } from './services/schepper-logs.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ScrapperLogs.name, schema: ScrapperLogsSchema }])],
  providers: [ScrapperLogsService],
  exports: [ScrapperLogsService],
  controllers: [ScrapperLogsController],
})
export class ScrapperLogsModule {}
