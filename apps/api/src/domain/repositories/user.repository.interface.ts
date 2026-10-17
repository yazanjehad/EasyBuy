import { User } from '../entities/user.entity.js';

/**
 * Payload required to create a new User.
 *
 * Defined in the domain layer so that the application/core logic never
 * references presentation-layer DTOs directly.
 */
export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

/**
 * Abstract repository contract for persisting and retrieving Users.
 *
 * The application layer (use-cases / services) depends on this abstraction
 * ONLY. The concrete implementation (Prisma, in-memory, etc.) is bound at
 * the infrastructure / module-binding layer.
 *
 * Declared as an abstract class (rather than a bare `interface`) so that it
 * can be used directly as a runtime DI token in NestJS — e.g.
 *
 *   @Inject(IUserRepository)
 *   private readonly userRepository: IUserRepository
 *
 * — while still enforcing the contract at the type level.
 */
export abstract class IUserRepository {
  abstract create(data: CreateUserParams): Promise<User>;

  abstract findByEmail(email: string): Promise<User | null>;

  abstract findByOne(userId: number): Promise<User | null>;
}
