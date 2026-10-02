import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EthnicModule } from './ethnic/ethnic.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { UploadModule } from './upload/upload.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    // 1. Quản lý biến môi trường (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Kết nối tới database MongoDB sac_viet
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ||
          'mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority',
        dbName: 'sac_viet',
      }),
    }),

    // 3. Các module tính năng
    EthnicModule,
    ProductModule,
    UserModule,
    AuthModule,
    OrderModule,
    UploadModule,
    RealtimeModule,
  ],
})
export class AppModule {}
