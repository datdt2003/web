import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(
    @Query('ethnicSlug') ethnicSlug?: string,
    @Query('category') category?: string,
  ) {
    const data = await this.productService.findAll(ethnicSlug, category);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.productService.findById(id);
    return {
      success: true,
      data,
    };
  }
}

