import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _id: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
