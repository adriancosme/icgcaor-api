import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IPromotion } from '../../../common/interfaces';

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
  promotion?: IPromotion;

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
    description: 'Price suggest discount',
  })
  @IsString()
  @IsNotEmpty()
  suggestPrice: string;

  @ApiProperty({
    description: 'Url product where was getted',
  })
  @IsString()
  @IsNotEmpty()
  pageUrl: string;

  @ApiProperty({
    description: 'Provider name or page name',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;
  @IsString()
  @IsNotEmpty()
  pageName: string;
}
