import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

function mongooseModuleOptions(): MongooseModuleOptions {
  console.log(process.env.MONGO_URI);
  return {
    uri: process.env.MONGO_URI,
    authSource: process.env.MONGO_AUTH_SOURCE,
    retryWrites: Boolean(process.env.MONGO_RETRY_WRITES) || false,
    useNewUrlParser: true,
  };
}

export default registerAs('database', () => ({ config: mongooseModuleOptions() }));
