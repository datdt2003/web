import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEthnic extends Document {
  slug: string
  name: string
  altNames?: string
  region: "bac" | "trung" | "nam"
  regions?: ("bac" | "trung" | "nam")[]
  residenceArea?: string
  population: number
  languageFamily: string
  image: string
  blurb: string
  detail: string
  culture: string[]
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
}

const EthnicSchema = new Schema<IEthnic>(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, trim: true },
    altNames: { type: String, trim: true },
    region: { type: String, index: true },
    regions: [{ type: String, index: true }],
    residenceArea: { type: String, trim: true },
    population: { type: Number, default: 0 },
    languageFamily: { type: String, trim: true },
    image: { type: String },
    blurb: { type: String },
    detail: { type: String },
    culture: [{ type: String, trim: true }],
    videoUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

export const Ethnic: Model<IEthnic> =
  mongoose.models.Ethnic || mongoose.model<IEthnic>("Ethnic", EthnicSchema)

export default Ethnic

