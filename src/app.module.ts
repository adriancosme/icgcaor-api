import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { PagesModule } from './modules/pages/pages.module';
import { ProductsModule } from './modules/products/products.module';
import { ScrapperLogsModule } from './modules/scrapper-logs/scrapper-logs.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  controllers: [AppController],
  imports: [CoreModule, AuthModule, UsersModule, ProductsModule, PagesModule, ScrapperLogsModule],
})
export class AppModule { }
