import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { PromotionSchema, Promotion } from './promotion.schema';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class Product extends Document {
  @ApiProperty()
  @Prop({ required: true })
  name: string;
  @ApiProperty()
  @Prop({ required: true, unique: true })
  internalCode: string;
  @ApiProperty()
  @Prop({ type: PromotionSchema, default: null })
  promotion: Promotion | null;
  @ApiProperty()
  @Prop()
  priceInList: string;
  @ApiProperty()
  @Prop()
  clientPrice: string;
  @ApiProperty()
  @Prop()
  suggestPrice: string;
  @ApiProperty()
  @Prop()
  pageUrl: string;
  @ApiProperty()
  @Prop()
  provider: string;
  @ApiProperty()
  @Prop()
  pageName: string;
}

export type ProductDocument = Product & Document;

export const ProductSchema = SchemaFactory.createForClass(Product);
