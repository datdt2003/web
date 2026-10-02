import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, pass: string) {
    if (!name || !email || !pass) {
      throw new BadRequestException('Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
    }

    if (pass.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.userService.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
    });

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    };
  }

  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new BadRequestException('Vui lòng nhập email và mật khẩu');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    };
  }

  async validateUserById(id: string) {
    return this.userService.findById(id);
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}

