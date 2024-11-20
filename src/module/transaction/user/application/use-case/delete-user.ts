import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserResponse } from '../response/user.reposne';
import { UserFactory } from '../../domain/factories/user.factory';

@Injectable()
export class DeleteUser implements IUseCase<UserResponse, boolean> {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async execute(data: UserResponse): Promise<boolean> {
    const user = UserFactory.toDomain(data);
    if (!user) return false;

    const result = await this.userService.delete(user);
    if (!result) return false;

    await this.redisService.del(`user with ${user.getEmail.getValue}: `);

    return true;
  }
}
