import mongoose, { Document, Model, Schema } from "mongoose"

export interface IPasswordResetCode extends Document {
  email: string
  codeHash: string
  attempts: number
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
}

const PasswordResetCodeSchema = new Schema<IPasswordResetCode>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

PasswordResetCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordResetCode: Model<IPasswordResetCode> =
  mongoose.models.PasswordResetCode ||
  mongoose.model<IPasswordResetCode>("PasswordResetCode", PasswordResetCodeSchema)

export default PasswordResetCode