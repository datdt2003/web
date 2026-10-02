import mongoose, { Schema, Document, Model } from "mongoose"

export interface IProduct extends Document {
  id: string
  name: string
  price: number
  image: string
  ethnicSlug: string
  category: string
  description?: string
  forSale: boolean
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    ethnicSlug: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    description: { type: String },
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

