import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

function mongooseModuleOptions(): MongooseModuleOptions {
  console.log(process.env.MONGO_URI);
  return {
    uri: process.env.MONGO_URI,
  };
}

export default registerAs('database', () => ({ config: mongooseModuleOptions() }));
