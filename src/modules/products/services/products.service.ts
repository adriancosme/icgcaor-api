import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  /**
   * Create product
   * @param dto CreateProductDto
   */
  async create(dto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(dto);
    await product.save().catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
    return product;
  }

  /**
   * Update a product
   * @param dto UpdateProductDto
   */
  async update(dto: UpdateProductDto): Promise<Product> {
    if (!dto.internalCode) {
      throw new BadRequestException('You need to provide a valid internal code');
    }
    const product = await this.productModel.findOneAndUpdate({ internalCode: dto.internalCode }, dto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Create products in batch
   * @param dto Array of CreateProductDto
   */
  async createBatch(dtos: CreateProductDto[]): Promise<Product[]> {
    const products: Product[] = [];
    for (const dto of dtos) {
      if (dto.internalCode) {
        const product = await this.productModel.findOneAndUpdate({ internalCode: dto.internalCode }, dto, { upsert: true });
        if (!!product) {
          const editedProduct = Object.assign(product, dto);
          products.push(editedProduct);
        }
      }
    }
    return products;
  }
}
