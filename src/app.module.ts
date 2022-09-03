import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { PagesModule } from './modules/pages/pages.module';

@Module({
  controllers: [AppController],
  imports: [CoreModule, AuthModule, UsersModule, ProductsModule, PagesModule],
})
export class AppModule {}
