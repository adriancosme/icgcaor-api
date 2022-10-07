import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePageDto } from '../dtos/create-page.dto';
import { UpdatePageDto } from '../dtos/update-page.dto';
import { Page, PageDocument } from '../schemas/page.schema';

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>) {}

  /**
   * Create page
   * @param dto CreatePageDto
   */
  async create(dto: CreatePageDto) {
    const page = new this.pageModel(dto);
    await page.save().catch((err) => {
      throw new BadGatewayException('Something happened', err);
    });
    return page;
  }

  /**
   * Update a page
   * @param dto UpdatePageDto
   */
  async update(dto: UpdatePageDto) {
    if (!dto._id) {
      throw new BadRequestException('You need to provide a valid id');
    }
    const page = await this.pageModel.findOneAndUpdate({ _id: dto._id }, dto, {new: true});
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  /**
   * Get list of pages
   */
  async getPages() {
    return await this.pageModel.find({});
  }

  /**
   * Delete one page given id
   * @param id
   */
  async deleteOne(id: string) {
    return await this.pageModel.findByIdAndDelete(id, { new: true });
  }
}
