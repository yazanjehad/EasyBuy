import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js'; // 👈 استيراد الموديول بدلاً من وضع الخادمة مباشرة
import { localStrategy } from './strategies/local.strategy.js';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config.js';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UserService } from '../user/user.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import refreshConfig from './config/refresh.config.js';
import { refreshTokenStrategy } from './strategies/refresh-token.strategy.js';

@Module({
  imports: [
    UserModule, // 👈 يمنح الوصول للـ UserService إذا كانت مصدّرة في UserModule
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],

      useFactory: (jwtConfiguration: ConfigType<typeof jwtConfig>) => ({
        secret: jwtConfiguration.secret,
        signOptions: jwtConfiguration.signOptions,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    localStrategy,
    UserService,
    JwtStrategy,
    refreshTokenStrategy,
  ],
})
export class AuthModule {}
