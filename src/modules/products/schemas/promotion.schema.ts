import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
@Schema({ _id: false })
export class Promotion extends Document {
  @ApiProperty()
  @Prop()
  description: string;
}

export type PromotionDocument = Promotion & Document;

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
