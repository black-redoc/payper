import { BaseEntity } from '@/shared/types';

export interface User extends BaseEntity {
  name: string;
  email: string;
  password: string;
}

export class UserEntity implements User {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public name: string,
    public email: string,
    public password: string
  ) {}

  static create(data: {
    name: string;
    email: string;
    password: string;
  }): UserEntity {
    const now = new Date();
    return new UserEntity(
      crypto.randomUUID(),
      now,
      now,
      data.name,
      data.email.toLowerCase(),
      data.password
    );
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  updatePassword(newPassword: string): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
