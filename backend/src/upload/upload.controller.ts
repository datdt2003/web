import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

// Đảm bảo thư mục uploads tồn tại an toàn trong mọi môi trường (kể cả Serverless read-only)
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isVercel ? join('/tmp', 'uploads') : join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Cannot create uploads directory:', e);
}

@Controller('upload')
export class UploadController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // Hỗ trợ upload video lên đến 100MB
      },
      fileFilter: (req, file, cb) => {
        // Cho phép các định dạng ảnh và video
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
          'video/mp4',
          'video/webm',
          'video/ogg',
          'video/quicktime',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Định dạng file '${file.mimetype}' không được hỗ trợ. Chỉ hỗ trợ ảnh (jpg, png, webp, svg) và video (mp4, webm).`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file tải lên');
    }

    // Đồng bộ lưu file vào MongoDB Atlas collection 'uploads' để mọi thiết bị/máy tính đều xem được
    try {
      if (this.connection?.db && file.path && fs.existsSync(file.path)) {
        const buffer = fs.readFileSync(file.path);
        await this.connection.db.collection('uploads').updateOne(
          { filename: file.filename },
          {
            $set: {
              filename: file.filename,
              originalName: file.originalname,
              contentType: file.mimetype,
              size: file.size,
              data: buffer,
              createdAt: new Date(),
            },
          },
          { upsert: true },
        );
      }
    } catch (dbErr) {
      console.warn('Lỗi lưu upload vào MongoDB Atlas:', dbErr);
    }

    // Dùng đường dẫn relative /api/upload/... để tương thích mọi domain và không bị cố định localhost
    const fileUrl = `/api/upload/${file.filename}`;

    return {
      success: true,
      message: 'Tải file lên máy chủ thành công',
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    // 1. Phục vụ file từ MongoDB Atlas collection 'uploads'
    try {
      if (this.connection?.db) {
        const fileDoc = await this.connection.db.collection('uploads').findOne({ filename });
        if (fileDoc && fileDoc.data) {
          const buffer = fileDoc.data.buffer
            ? Buffer.from(fileDoc.data.buffer)
            : Buffer.from(fileDoc.data);
          res.set({
            'Content-Type': fileDoc.contentType || 'image/jpeg',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
          });
          return res.send(buffer);
        }
      }
    } catch (err) {
      console.warn('Error reading upload from MongoDB Atlas:', err);
    }

    // 2. Fallback sang file vật lý trên ổ đĩa
    const localPath = join(uploadDir, filename);
    if (fs.existsSync(localPath)) {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });
      return res.sendFile(localPath);
    }

    throw new NotFoundException('File không tồn tại');
  }
}
