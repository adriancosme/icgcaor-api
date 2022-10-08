import 'dotenv/config';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap()
  .then(async (app) => {
    console.info('Running command');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Server failed to start command`, err);
    process.exit(1);
  });