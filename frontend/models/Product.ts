import mongoose, { Schema, Document, Model } from "mongoose"

export interface IProduct extends Document {
  id: string
  name: string
  price?: number
  image: string
  ethnicSlug: string
  category: string
  description?: string
  origin?: string
  craft?: string
  culturalValue?: string
  forSale: boolean
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    image: { type: String, required: true },
    ethnicSlug: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    description: { type: String },
    origin: { type: String, trim: true },
    craft: { type: String, trim: true },
    culturalValue: { type: String, trim: true },
    forSale: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

export default Product

