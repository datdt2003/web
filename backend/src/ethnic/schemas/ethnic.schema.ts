import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EthnicDocument = Ethnic & Document;

@Schema({ timestamps: true, collection: 'ethnics' })
export class Ethnic {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop()
  name: string;

  @Prop()
  altNames?: string;

  @Prop({ index: true })
  region: string;

  @Prop({ type: [String], default: [] })
  regions?: string[];

  @Prop()
  residenceArea?: string;

  @Prop()
  population: number;

  @Prop()
  languageFamily: string;

  @Prop()
  image: string;

  @Prop()
  blurb: string;

  @Prop()
  detail: string;

  @Prop([String])
  culture: string[];

  @Prop()
  videoUrl?: string;
}

export const EthnicSchema = SchemaFactory.createForClass(Ethnic);

