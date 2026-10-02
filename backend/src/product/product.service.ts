import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(ethnicSlug?: string, category?: string): Promise<Product[]> {
    const filter: Record<string, any> = {};
    if (ethnicSlug) filter.ethnicSlug = ethnicSlug;
    if (category) filter.category = category;

    return this.productModel.find(filter).exec();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findOne({ id }).exec();
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có mã '${id}'`);
    }
    return product;
  }
}

