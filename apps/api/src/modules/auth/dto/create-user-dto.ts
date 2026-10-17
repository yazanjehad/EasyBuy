import { ApiAcceptedResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({
    description: 'اسم المستخدم',
    example: 'أحمد محمد',
    type: String,
  })
  @IsString({ message: 'common.validation.STRING' })
  name: string;

  @ApiProperty({
    description: 'البريد الإلكتروني للمستخدم',
    example: 'ahmad@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'common.validation.EMAIL' })
  email: string;

  @ApiProperty({
    description: 'كلمة المرور (يجب ألا تقل عن 8 أحرف)',
    example: 'Password123!',
    minLength: 8,
    type: String,
  })
  @IsString({ message: 'common.validation.STRING' })
  @MinLength(8, { message: 'common.validation.MIN_LENGTH' })
  password: string;
}
