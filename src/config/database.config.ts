import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

function mongooseModuleOptions(): MongooseModuleOptions {  
  return {
    uri: process.env.MONGO_URI,
  };
}

export default registerAs('database', () => ({ config: mongooseModuleOptions() }));
