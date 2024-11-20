import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserResponse } from '../response/user.reposne';
import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserId } from '../../domain/value-object/userId';

@Injectable()
export class FindById implements IUseCase<string, UserResponse | null> {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async execute(id: string): Promise<UserResponse | null> {
    const cache = await this.redisService.get<UserResponse>(
      `user with ${id}: `,
    );
    if (cache != null) return cache;

    const userId = new UserId(id);
    const user = await this.userService.findById(userId);

    if (!user) return null;

    const result = UserFactory.toResponse(user);

    if (user) {
      await this.redisService.set(
        `user with ${user.getId.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
    }

    return result;
  }
}
