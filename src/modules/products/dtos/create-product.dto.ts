import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Promotion } from '../schemas/promotion.schema';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Internal code, must be unique',
  })
  @IsString()
  @IsNotEmpty()
  internalCode: string;

  @ApiProperty({
    description: 'Promotion, is optional',
  })
  promotion?: Promotion;

  @ApiProperty({
    description: 'Price in list',
  })
  @IsString()
  @IsNotEmpty()
  priceInList: string;

  @ApiProperty({
    description: 'Price payment discount',
  })
  @IsString()
  @IsNotEmpty()
  clientPrice: string;

  @ApiProperty({
    description: 'Price payment discount',
  })
  @IsString()
  @IsNotEmpty()
  suggestPrice: string;
}
