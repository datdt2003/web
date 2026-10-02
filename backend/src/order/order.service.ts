import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private realtimeService: RealtimeService,
  ) {}

  async create(orderData: any): Promise<Order> {
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    if (!orderData.customerName || !orderData.email) {
      throw new BadRequestException('Vui lòng cung cấp họ tên và email nhận hàng');
    }

    const subtotal = orderData.items.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
    const shippingFee = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shippingFee;

    const newOrder = new this.orderModel({
      ...orderData,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
    });

    return newOrder.save();
  }

  async findAll(email?: string): Promise<Order[]> {
    const filter = email ? { email } : {};
    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const validStatuses = ['pending', 'processing', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Trạng thái không hợp lệ: ${status}`);
    }

    const updateData: any = { status };
    if (status === 'completed') {
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date();
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có mã '${id}'`);
    }

    // Phát sự kiện realtime tới Next.js
    this.realtimeService.emitEvent('order.updated', {
      orderId: id,
      status: order.status,
      paymentStatus: (order as any).paymentStatus || (status === 'completed' ? 'paid' : 'unpaid'),
    });

    return order;
  }

  async delete(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có mã '${id}'`);
    }

    if (order.status !== 'cancelled') {
      throw new BadRequestException('Chỉ có thể xóa các đơn hàng đã bị hủy');
    }

    await this.orderModel.findByIdAndDelete(id).exec();

    this.realtimeService.emitEvent('order.deleted', {
      orderId: id,
    });

    return order;
  }
}
