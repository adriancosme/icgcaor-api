import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class ScrapperLogs {
  @Prop()
  productsImported: number;
}

export type ScrapperLogsDocument = ScrapperLogs & Document;
export const ScrapperLogsSchema = SchemaFactory.createForClass(ScrapperLogs);
