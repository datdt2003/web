import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, index: true })
  ethnicSlug: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  forSale: boolean;

  @Prop({ default: true })
  inStock: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

