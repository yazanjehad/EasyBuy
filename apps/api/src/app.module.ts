import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module.js';
import { I18nConfigModule } from './infrastructure/i18n/i18n.module.js';
import jwtConfig from './modules/auth/config/jwt.config.js';

@Module({
  imports: [
    // 1. تحميل الإعدادات أولاً وجعلها عامة (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    // 2. i18n configuration + global exception filter + response interceptor
    I18nConfigModule,
    // 3. الموديولات الأخرى
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
