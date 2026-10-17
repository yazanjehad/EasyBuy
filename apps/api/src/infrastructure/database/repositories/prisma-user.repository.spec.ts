import { jest } from '@jest/globals';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../../domain/entities/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrismaService: {
    user: {
      create: jest.Mock<(...args: any[]) => Promise<any>>;
      findUnique: jest.Mock<(...args: any[]) => Promise<any>>;
    };
  };

  beforeEach(() => {
    mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    repository = new PrismaUserRepository(
      mockPrismaService as unknown as PrismaService,
    );
  });

  describe('create()', () => {
    it('should call prisma.user.create with correct data and map to domain User', async () => {
      const prismaUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      };
      mockPrismaService.user.create.mockResolvedValue(prismaUser);

      const result = await repository.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('hashed-password');
    });
  });

  describe('findByEmail()', () => {
    it('should call prisma.user.findUnique with correct where clause and map to domain User', async () => {
      const prismaUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed-password',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.findByEmail('jane@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Jane Doe');
      expect(result!.email).toBe('jane@example.com');
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByOne()', () => {
    it('should call prisma.user.findUnique with correct where clause and map to domain User', async () => {
      const prismaUser = {
        id: 42,
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'hashed-password',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.findByOne(42);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
      });
      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe(42);
      expect(result!.name).toBe('Alice Smith');
      expect(result!.email).toBe('alice@example.com');
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByOne(999);

      expect(result).toBeNull();
    });
  });
});
