import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'common.validation.STRING' })
  name: string;

  @IsEmail({}, { message: 'common.validation.EMAIL' })
  email: string;

  @IsString({ message: 'common.validation.STRING' })
  @MinLength(8, { message: 'common.validation.MIN_LENGTH' })
  password: string;
}
