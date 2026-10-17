import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module.js';
import { UserService } from './modules/user/user.service.js';
import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository.js';
import { UserMapper } from './infrastructure/database/repositories/user.mapper.js';
import { IUserRepository } from './domain/repositories/user.repository.interface.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { User } from './domain/entities/user.entity.js';
import jwtConfig from './modules/auth/config/jwt.config.js';
import refreshConfig from './modules/auth/config/refresh.config.js';

/**
 * DI smoke test: boots the NestJS DI container up to the point where every
 * provider is instantiated — WITHOUT calling onModuleInit() (which would
 * trigger Prisma $connect / HTTP listener).
 *
 * This validates:
 *   - All import paths resolve at runtime (ESM)
 *   - UserService → IUserRepository → PrismaUserRepository binding
 *   - PrismaService is globally accessible (via @Global PrismaModule)
 *   - UserMapper is wired correctly
 *   - The User domain entity is reachable end-to-end
 *
 * Note: The i18n module (I18nConfigModule → nestjs-i18n) creates a
 * require(esm) cycle with @nestjs/common inside Jest's runtime. The core
 * DI bindings are validated here using a composed testing module that
 * mirrors AppModule's provider graph minus the i18n module.
 */
describe('DI Container Smoke Test', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jwtConfig, refreshConfig],
        }),
        PrismaModule,
        UserModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should resolve UserService as a singleton', () => {
    const userService = moduleRef.get<UserService>(UserService);
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should bind IUserRepository token to PrismaUserRepository', () => {
    const userRepository = moduleRef.get<IUserRepository>(IUserRepository);
    expect(userRepository).toBeInstanceOf(PrismaUserRepository);
    expect(userRepository).toBeInstanceOf(IUserRepository);
  });

  it('should inject the same PrismaUserRepository instance into UserService', () => {
    const userService = moduleRef.get<UserService>(UserService);
    const userRepository = moduleRef.get<IUserRepository>(IUserRepository);

    // The @Inject(IUserRepository) in UserService constructor must resolve
    // to the same singleton instance that the module exposes.
    const injectedRepo = (
      userService as unknown as { userRepository: IUserRepository }
    ).userRepository;
    expect(injectedRepo).toBe(userRepository);
    expect(injectedRepo).toBeInstanceOf(PrismaUserRepository);
  });

  it('should make PrismaService globally accessible (via @Global PrismaModule)', () => {
    const prismaService = moduleRef.get<PrismaService>(PrismaService);
    expect(prismaService).toBeInstanceOf(PrismaService);
  });

  it('should resolve PrismaUserRepository with its PrismaService dependency', () => {
    const repo = moduleRef.get<IUserRepository>(IUserRepository);
    const prisma = moduleRef.get<PrismaService>(PrismaService);

    expect(repo).toBeInstanceOf(PrismaUserRepository);
    const prismaRepo = repo as unknown as { prisma: PrismaService };
    expect(prismaRepo.prisma).toBe(prisma);
  });

  it('should load UserMapper as a pure utility (toDomain mapping)', () => {
    const domainUser = UserMapper.toDomain({
      id: 99,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-pw',
    });

    expect(domainUser).toBeInstanceOf(User);
    expect(domainUser.id).toBe(99);
    expect(domainUser.name).toBe('Test User');
    expect(domainUser.email).toBe('test@example.com');
    expect(domainUser.password).toBe('hashed-pw');
  });
});
