/**
 * Domain Entity: User
 *
 * Pure domain object that represents a User in the core business model.
 * It has NO awareness of persistence technology (e.g. Prisma), transport
 * concerns (e.g. DTOs), or frameworks. It is the single source of truth
 * for what a "User" is across the entire application.
 */
export class User {
  id: number;

  name: string;

  email: string;

  password: string;

  constructor(partial: Partial<User> = {}) {
    Object.assign(this, partial);
  }
}
