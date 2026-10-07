import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Hon Y Dat Viet Backend API is running',
      timestamp: new Date().toISOString(),
      service: 'hon-y-dat-viet-backend',
    };
  }

  @Get('health')
  checkHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
