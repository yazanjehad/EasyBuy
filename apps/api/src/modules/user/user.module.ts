import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/prisma-user.repository';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * UserModule is the composition root for the User feature.
 *
 * It binds the {@link IUserRepository} abstract token to the concrete
 * {@link PrismaUserRepository} implementation — the rest of the code
 * base only ever references the abstraction.
 */
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserService, IUserRepository],
})
export class UserModule {}
