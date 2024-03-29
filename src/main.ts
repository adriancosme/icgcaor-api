import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CONFIG_SERVER_PORT, NODE_ENV } from './config/config.constants';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Swagger
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nest Starter Boilerplate')
    .setDescription('Nest collection of tools and authentication ready to use.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  // Environments
  const port = configService.get<number>(CONFIG_SERVER_PORT);
  const environment = configService.get<string>(NODE_ENV);
  environment === 'development' ? SwaggerModule.setup('', app, document) : null;

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Interceptors and validators
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      transform: true,
    }),
  );

  // Security setup
  app.use(helmet());
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // compression
  app.use(compression());
  await app.listen(port);
  logger.log(`Application is running in ${environment.toUpperCase()} on: ${await app.getUrl()}`);
}
bootstrap();
