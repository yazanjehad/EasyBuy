import { User } from './user.entity.js';

describe('User Domain Entity', () => {
  it('should create a User with all provided fields', () => {
    const user = new User({
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Jane Doe');
    expect(user.email).toBe('jane@example.com');
    expect(user.password).toBe('hashed-password');
  });

  it('should create an empty User when no partial is provided', () => {
    const user = new User();

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeUndefined();
    expect(user.name).toBeUndefined();
    expect(user.email).toBeUndefined();
    expect(user.password).toBeUndefined();
  });

  it('should allow partial construction (only some fields)', () => {
    const user = new User({
      name: 'Partial User',
      email: 'partial@example.com',
    });

    expect(user.name).toBe('Partial User');
    expect(user.email).toBe('partial@example.com');
    expect(user.id).toBeUndefined();
    expect(user.password).toBeUndefined();
  });

  it('should be a pure domain object with no infrastructure references', () => {
    // A domain entity should be constructable with zero dependencies.
    const user = new User();
    expect(user).toBeInstanceOf(User);
    // Verify it has no Prisma or NestJS markers
    expect((user as unknown as { prisma?: unknown }).prisma).toBeUndefined();
    expect((user as unknown as { __v?: unknown }).__v).toBeUndefined();
  });
});
