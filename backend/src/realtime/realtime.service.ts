import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  // Next.js frontend URL
  private readonly nextjsUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  async emitEvent(type: string, data?: any) {
    try {
      await fetch(`${this.nextjsUrl}/api/realtime/emit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });
      this.logger.debug(`Đã phát sự kiện realtime: ${type}`);
    } catch (error) {
      this.logger.error(`Lỗi phát sự kiện realtime ${type} tới Next.js: ${error.message}`);
    }
  }
}

