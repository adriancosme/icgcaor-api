import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Page extends Document {
  @ApiProperty()
  @Prop({ required: true })
  url: string;
  @ApiProperty()
  @Prop({ required: true })
  name: string;
}

export type PageDocument = Page & Document;

export const PageSchema = SchemaFactory.createForClass(Page);
