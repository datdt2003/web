import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOrderItem {
  productId: string
  name: string
  price: number
  qty: number
  image?: string
  category?: string
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId
  customerName: string
  email: string
  phone?: string
  address?: string
  items: IOrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentStatus?: "unpaid" | "paid" | "failed"
  paymentCode?: string
  paidAt?: Date
  paymentTransactionId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, default: 1 },
    image: { type: String },
    category: { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentCode: { type: String, index: true },
    paidAt: { type: Date },
    paymentTransactionId: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
)

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order


