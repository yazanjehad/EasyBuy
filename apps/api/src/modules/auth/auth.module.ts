import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // 👈 استيراد الموديول بدلاً من وضع الخادمة مباشرة
import { localStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshConfig from './config/refresh.config';
import { refreshTokenStrategy } from './strategies/refresh-token.strategy';

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
