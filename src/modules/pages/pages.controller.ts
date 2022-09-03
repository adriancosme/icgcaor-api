import { Body, Controller, Post, Put } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DataOutput } from 'src/common/interfaces';
import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
import { Page } from './schemas/page.schema';
import { PagesService } from './services/pages.service';

@Controller('pages')
export class PagesController {
  constructor(public service: PagesService) {}
  /**
   * Create Page  - Single
   * @param dto Page Form
   * @example POST /pages
   */

  @ApiTags('Pages single operation')
  @ApiOperation({ summary: 'Create page - Single', description: 'Register an page to analyze and get products' })
  @ApiCreatedResponse({ status: 201, description: 'Page created successfully', type: Page })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with the validation issues' })
  @ApiBody({ type: CreatePageDto })
  @Post()
  async createOne(@Body() dto: CreatePageDto): Promise<DataOutput<Page>> {
    return { message: 'Page created successfully', output: await this.service.create(dto) };
  }

  /**
   * Update one - Single
   * @param dto Update Page Form
   * @example PUT /pages
   */
  @ApiTags('Pages single operation')
  @ApiOperation({ summary: 'Update page - Single', description: 'Update page by Id. You have to provide an id in the body' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ required: true, type: UpdatePageDto })
  @Put()
  async updateOne(@Body() dto: UpdatePageDto) {
    return await this.service.update(dto);
  }
}
