import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 1 })
  qty: number;

  @Prop()
  image?: string;

  @Prop()
  category?: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  shippingFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

