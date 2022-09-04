import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ExportProductDto {
  @ApiProperty({
    description: 'Date start',
  })
  @IsDateString()
  @IsNotEmpty()
  dateStart: string;
  @ApiProperty({
    description: 'Date end',
  })
  @IsNotEmpty()
  @IsDateString()
  dateEnd: string;
}
