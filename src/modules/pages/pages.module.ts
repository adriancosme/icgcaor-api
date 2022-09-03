import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PagesController } from './pages.controller';
import { Page, PageSchema } from './schemas/page.schema';
import { PagesService } from './services/pages.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }])],
  providers: [PagesService],
  exports: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}
