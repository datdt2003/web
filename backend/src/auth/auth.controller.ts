import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  async getProfile(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Không có token xác thực');
    }

    const token = authHeader.substring(7);
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.authService.validateUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }
      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          savedEthnics: user.savedEthnics || [],
        },
      };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}

