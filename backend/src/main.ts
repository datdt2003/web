import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Cấu hình tiền tố chung cho tất cả API (ví dụ: http://localhost:5000/api/...)
  app.setGlobalPrefix('api');

  // 2. Kích hoạt Validation tự động qua class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Phục vụ thư mục static file uploads
  const uploadDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  // 4. Cấu hình CORS cho phép frontend Next.js kết nối
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`\n======================================================`);
  console.log(`🚀 NestJS Backend đang chạy tại: http://localhost:${port}/api`);
  console.log(`📂 Static uploads phục vụ tại:   http://localhost:${port}/uploads/`);
  console.log(`📡 Đã kết nối cơ sở dữ liệu MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`======================================================\n`);
}

bootstrap();
