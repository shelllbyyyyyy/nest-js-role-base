import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { Provider as UserProvider } from '../enum/provider';
import { Email } from '../value-object/email';
import { Provider } from '../value-object/provider';
import { UserId } from '../value-object/userId';

export type Filter = {
  id?: UserId;
  email?: Email;
  username?: string;
  created_at?: Date;
  created_at_start?: Date;
  created_at_end?: Date;
  limit?: number;
  offset?: number;
  order_by?: string;
  is_verified?: boolean;
};

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
  }

  async createUser(
    username: string,
    email: Email,
    password: string,
  ): Promise<UserEntity> {
    const role = new RoleEntity(1, 'USER');
    const provider = new Provider(UserProvider.LOCAL);

    const authorities = new Set<RoleEntity>();
    authorities.add(role);

    const newUser = new UserEntity();
    newUser.setUsername(username);
    newUser.setEmail(email);
    newUser.setPassword(password);
    newUser.setAuthorities(authorities);
    newUser.setProvider(provider);

    return await this.userRepository.save(newUser);
  }

  async createUserOAuth(
    username: string,
    email: Email,
    password: string,
    provider: Provider,
    authorities: Set<RoleEntity>,
  ): Promise<UserEntity> {
    const newUser = new UserEntity();
    newUser.setUsername(username);
    newUser.setEmail(email);
    newUser.setPassword(password);
    newUser.setAuthorities(authorities);
    newUser.setProvider(provider);
    newUser.setIsVerified(true);

    return await this.userRepository.save(newUser);
  }

  async findById(userId: UserId): Promise<UserEntity | null> {
    return await this.userRepository.findById(userId);
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    return await this.userRepository.findByEmail(email);
  }

  async delete(data: UserEntity): Promise<boolean> {
    return await this.userRepository.delete(data);
  }

  async update(data: UserEntity): Promise<boolean> {
    return await this.userRepository.update(data);
  }

  async changeEmail(data: UserEntity): Promise<boolean> {
    return await this.userRepository.changeEmail(data);
  }

  async changePassword(data: UserEntity): Promise<boolean> {
    return await this.userRepository.changePassword(data);
  }

  async changeUsername(data: UserEntity): Promise<boolean> {
    return await this.userRepository.changeUsername(data);
  }

  async updateProvider(data: UserEntity): Promise<boolean> {
    return await this.userRepository.updateProvider(data);
  }

  async updateAuthorities(data: UserEntity): Promise<boolean> {
    return await this.userRepository.updateAuthorities(data);
  }

  async verifyUser(data: UserEntity): Promise<boolean> {
    return await this.userRepository.verifyUser(data);
  }

  async findByFilter(data: Filter): Promise<UserEntity[]> {
    return await this.userRepository.filterBy(data);
  }
}
