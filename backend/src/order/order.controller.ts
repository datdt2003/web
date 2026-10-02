import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() body: any) {
    const order = await this.orderService.create(body);
    return {
      success: true,
      message: 'Đặt hàng thành công',
      orderId: (order as any)._id,
      data: order,
    };
  }

  @Get()
  async getOrders(@Query('email') email?: string) {
    const data = await this.orderService.findAll(email);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const data = await this.orderService.updateStatus(id, status);
    return {
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data,
    };
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    const data = await this.orderService.delete(id);
    return {
      success: true,
      message: 'Xóa đơn hàng thành công',
      data,
    };
  }
}
