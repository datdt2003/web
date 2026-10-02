import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ethnic, EthnicDocument } from './schemas/ethnic.schema';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class EthnicService {
  constructor(
    @InjectModel(Ethnic.name) private ethnicModel: Model<EthnicDocument>,
    private realtimeService: RealtimeService,
  ) {}

  async findAll(region?: string, q?: string): Promise<Ethnic[]> {
    const filter: Record<string, any> = {};

    const conditions: Record<string, any>[] = [];

    if (region && ['bac', 'trung', 'nam'].includes(region)) {
      conditions.push({
        $or: [{ region }, { regions: region }],
      });
    }

    if (q) {
      conditions.push({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { altNames: { $regex: q, $options: 'i' } },
          { blurb: { $regex: q, $options: 'i' } },
        ],
      });
    }

    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$and = conditions;
    }

    return this.ethnicModel.find(filter).sort({ population: -1 }).exec();
  }

  async findBySlug(slug: string): Promise<Ethnic> {
    const ethnic = await this.ethnicModel.findOne({ slug }).exec();
    if (!ethnic) {
      throw new NotFoundException(`Không tìm thấy dân tộc có mã slug '${slug}'`);
    }
    return ethnic;
  }

  async update(slug: string, updateData: Partial<Ethnic>): Promise<Ethnic> {
    const updated = await this.ethnicModel
      .findOneAndUpdate({ slug }, { $set: updateData }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy dân tộc có mã slug '${slug}' để cập nhật`);
    }
    this.realtimeService.emitEvent('ethnic.updated', { slug });
    return updated;
  }

  async removeVideo(slug: string): Promise<Ethnic> {
    const updated = await this.ethnicModel
      .findOneAndUpdate({ slug }, { $set: { videoUrl: '' } }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy dân tộc có mã slug '${slug}' để gỡ video`);
    }
    this.realtimeService.emitEvent('ethnic.updated', { slug });
    return updated;
  }
}
