import { Body, Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  loginUser(@Request() req: any) {
    return this.authService.login(req.user.id, req.user.name, req.user.email);
  }
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@Request() req: any) {
    // ✅ يُفضل إرجاع Object صريح ليتعامل معه Next.js مع .json() بدون أخطاء
    return {
      message: 'now you can access protected route',
      user: req.user,
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.id, req.user.email);
  }
}
