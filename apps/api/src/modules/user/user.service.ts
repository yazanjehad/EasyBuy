import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user-dto.js';
import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

/**
 * Application service (use-case orchestrator) for Users.
 *
 * Depends ONLY on the {@link IUserRepository} abstraction — it has no
 * knowledge of Prisma or any other persistence technology. The concrete
 * repository implementation is injected through the token bound in
 * {@link UserModule}.
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await hash(password);

    return await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findByOne(userId: number) {
    return await this.userRepository.findByOne(userId);
  }
}
