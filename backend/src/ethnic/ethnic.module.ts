import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ethnic, EthnicSchema } from './schemas/ethnic.schema';
import { EthnicService } from './ethnic.service';
import { EthnicController } from './ethnic.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ethnic.name, schema: EthnicSchema }]),
  ],
  controllers: [EthnicController],
  providers: [EthnicService],
  exports: [EthnicService],
})
export class EthnicModule {}

