import { Injectable } from '@nestjs/common';

import { UserEntity } from '../entities/user.entity';
import { UserId } from '../value-object/userId';
import { Email } from '../value-object/email';
import { Filter } from '../services/user.service';

@Injectable()
export abstract class UserRepository {
  abstract findAll(): Promise<UserEntity[]>;
  abstract save(data: UserEntity): Promise<UserEntity>;
  abstract findById(id: UserId): Promise<UserEntity | null>;
  abstract findByEmail(email: Email): Promise<UserEntity | null>;
  abstract delete(data: UserEntity): Promise<boolean>;
  abstract update(data: UserEntity): Promise<boolean>;
  abstract changePassword(data: UserEntity): Promise<boolean>;
  abstract changeEmail(data: UserEntity): Promise<boolean>;
  abstract changeUsername(data: UserEntity): Promise<boolean>;
  abstract updateProvider(data: UserEntity): Promise<boolean>;
  abstract updateAuthorities(data: UserEntity): Promise<boolean>;
  abstract verifyUser(data: UserEntity): Promise<boolean>;
  abstract filterBy(data: Filter): Promise<UserEntity[]>;
}
