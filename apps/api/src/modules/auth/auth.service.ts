import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPaylod';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private readonly refreshConfiguration: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) {
      throw new Error('User already exists');
    }
    return await this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, name: user.name, email: user.email };
  }
  async login(userId: number, name: string, email: string) {
    const { accessToken, refreshToken } = await this.generateToken(
      userId,
      email,
    );

    return {
      id: userId,
      name,
      email,
      accessToken,
      refreshToken,
    };
  }

  async generateToken(userId: number, email: string) {
    const payload: AuthJwtPayload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshConfiguration),
    ]);

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findByOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser = { id: user.id, name: user.name, email: user.email };
    return currentUser;
  }

  async validateRefreshToken(userId: number) {
    const user = await this.userService.findByOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser = { id: user.id, name: user.name, email: user.email };
    return currentUser;
  }

  async refreshToken(userId: number, email: string) {
    const { accessToken, refreshToken } = await this.generateToken(
      userId,
      email,
    );

    return {
      id: userId,
      name,
      email,
      accessToken,
      refreshToken,
    };
  }
}
