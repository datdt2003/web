import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "user" | "admin"
  savedEthnics: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedEthnics: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
)

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User

