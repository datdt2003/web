import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

// Đảm bảo thư mục uploads tồn tại
const uploadDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('upload')
export class UploadController {
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file tải lên');
    }

    const host = process.env.BACKEND_URL || 'http://localhost:5000';
    const fileUrl = `${host}/uploads/${file.filename}`;

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
}

