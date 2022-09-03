import { Body, Controller, Get, ParseArrayPipe, Post, Put, UseGuards } from '@nestjs/common';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Product } from './schemas/product.schema';
import { ProductsService } from './services/products.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(public service: ProductsService) {}
  /**
   * Create Product - Single
   * @param dto Product Form
   * @example POST /products
   */

  @ApiTags('Products single operation')
  @ApiOperation({ summary: 'Create product - Single', description: 'Register an product' })
  @ApiCreatedResponse({ status: 201, description: 'Product created successfully', type: Product })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with the validation issues' })
  @ApiBody({ type: CreateProductDto })
  @Post()
  async createOne(@Body() dto: CreateProductDto): Promise<DataOutput<Product>> {
    return { message: 'Product created successfully', output: await this.service.create(dto) };
  }

  /**
   * Update one - Single
   * @param dto Update Product Form
   * @example PUT /products
   */
  @ApiTags('Products single operation')
  @ApiOperation({ summary: 'Update product - Single', description: 'Update product by Id. You have to provide an id in the body' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ required: true, type: UpdateProductDto })
  @Put()
  async updateOne(@Body() dto: UpdateProductDto) {
    return await this.service.update(dto);
  }

  /**
   * Create products - Batch
   * @param dto Product Form but in Array format
   * @example POST /products/bulk
   */
  @ApiTags('Products batch operations')
  @ApiOperation({ summary: 'Create Products - Batch', description: 'Register products in batch.' })
  @ApiCreatedResponse({ status: 201, description: 'Products created successfully', type: Product })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ type: [CreateProductDto] })
  @Post('bulk')
  async createBulk(@Body(new ParseArrayPipe({ items: CreateProductDto })) dto: CreateProductDto[]): Promise<DataOutput<Product[]>> {
    return { message: 'Products created successfully', output: await this.service.createBatch(dto) };
  }

  /**
   * Get count of products
   */
  @ApiTags('Products single operation')
  @ApiOperation({ summary: 'Get count of products', description: 'Get count of products' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @Get('/count')
  async getCount() {
    return this.service.getCountTotal();
  }
}
