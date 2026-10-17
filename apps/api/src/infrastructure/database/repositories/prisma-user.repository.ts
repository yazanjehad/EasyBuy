import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import {
  CreateUserParams,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from './user.mapper';

/**
 * Prisma implementation of the {@link IUserRepository} contract.
 *
 * This is the ONLY place where Prisma is referenced for user data access.
 * Both the domain and the application layer (UserService) are completely
 * decoupled from it — they only know about the `IUserRepository` abstraction.
 */
@Injectable()
export class PrismaUserRepository extends IUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: CreateUserParams): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });
    if (!prismaUser) {
      return null;
    }
    return UserMapper.toDomain(prismaUser);
  }

  async findByOne(userId: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!prismaUser) {
      return null;
    }
    return UserMapper.toDomain(prismaUser);
  }
}
