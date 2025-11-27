/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRepository } from '@/domain/repositories/UserRepository';
import { UserEntity } from '@/domain/entities/User';
import { getPrisma } from '../database/prisma';

export class PrismaUserRepository implements UserRepository {
  async save(user: UserEntity): Promise<UserEntity> {
    const prisma = await getPrisma();
    const created = await prisma.user.create({
      data: {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const prisma = await getPrisma();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: user.updatedAt,
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const prisma = await getPrisma();
    await prisma.user.delete({
      where: { id },
    });
  }

  private mapToEntity(data: any): UserEntity {
    return new UserEntity(
      data.id,
      data.createdAt,
      data.updatedAt,
      data.name,
      data.email,
      data.password
    );
  }
}
