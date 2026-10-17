import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity.js';

/**
 * Maps between the Prisma persistence model and the pure domain
 * User entity. Keeping the mapping logic isolated in this class ensures
 * the domain layer never has to know about Prisma types.
 */
export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      password: prismaUser.password,
    });
  }
}
