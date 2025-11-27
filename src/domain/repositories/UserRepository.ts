import { UserEntity } from '../entities/User';

export interface UserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
