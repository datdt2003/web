import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isVercel ? join('/tmp', 'uploads') : join(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Cannot create uploads directory:', e);
}

const expressApp: Express = express();
let isAppInitialized = false;

export async function createApp(expressInstance?: Express) {
  const app = expressInstance
    ? await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressInstance))
    : await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Cấu hình tiền tố chung cho tất cả API (/api/...)
  app.setGlobalPrefix('api');

  // 2. Kích hoạt Validation tự động
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Phục vụ thư mục static file uploads
  try {
    app.useStaticAssets(uploadDir, {
      prefix: '/uploads/',
    });
  } catch (e) {
    console.warn('Could not setup static uploads directory:', e);
  }

  // 4. Cấu hình CORS cho phép frontend kết nối đầy đủ
  const frontendUrl = process.env.FRONTEND_URL || 'https://honydatviet.vercel.app';
  const allowedOrigins = [
    frontendUrl,
    'https://honydatviet.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép nếu không có origin (curl, mobile app) hoặc nằm trong whitelist hoặc domain vercel.app
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  return app;
}

// Chạy server khi ở môi trường local bình thường
if (!isVercel) {
  async function bootstrap() {
    const app = await createApp();
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`\n======================================================`);
    console.log(`🚀 NestJS Backend đang chạy tại: http://localhost:${port}/api`);
    console.log(`📂 Static uploads phục vụ tại:   http://localhost:${port}/uploads/`);
    console.log(`📡 Đã kết nối cơ sở dữ liệu MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sac_viet'}`);
    console.log(`🔗 Frontend URL cho phép:        ${process.env.FRONTEND_URL || 'https://honydatviet.vercel.app'}`);
    console.log(`======================================================\n`);
  }
  bootstrap();
}

// Serverless Handler cho Vercel deployment
export default async function handler(req: Request, res: Response) {
  if (!isAppInitialized) {
    const app = await createApp(expressApp);
    await app.init();
    isAppInitialized = true;
  }
  return expressApp(req, res);
}
