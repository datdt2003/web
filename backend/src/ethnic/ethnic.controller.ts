import { Controller, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { EthnicService } from './ethnic.service';

@Controller('ethnic')
export class EthnicController {
  constructor(private readonly ethnicService: EthnicService) {}

  @Get()
  async getAll(
    @Query('region') region?: string,
    @Query('q') q?: string,
  ) {
    const data = await this.ethnicService.findAll(region, q);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.ethnicService.findBySlug(slug);
    return {
      success: true,
      data,
    };
  }

  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateData: any,
  ) {
    const data = await this.ethnicService.update(slug, updateData);
    return {
      success: true,
      message: 'Cập nhật thông tin dân tộc thành công',
      data,
    };
  }

  @Delete(':slug/video')
  async removeVideo(@Param('slug') slug: string) {
    const data = await this.ethnicService.removeVideo(slug);
    return {
      success: true,
      message: 'Đã gỡ video thành công',
      data,
    };
  }
}
