import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import jwtConfig from './modules/auth/config/jwt.config';

@Module({
  imports: [
    // 1. تحميل الإعدادات أولاً وجعلها عامة (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    // 2. الموديولات الأخرى
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService], // 👈 لا داعي لوضع PrismaService هنا إذا كانت مصدّرة داخل PrismaModule
})
export class AppModule {}
