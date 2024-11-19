import { Injectable } from '@nestjs/common';

import { InvalidInputError } from '@/common/exceptions/invalid-input.error';
import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserResponse } from '../response/user.reposne';

@Injectable()
export class ChangeUsername
  implements IActionHandler<UserResponse, UserUpdate, boolean>
{
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async handle(data: UserResponse, payload: UserUpdate): Promise<boolean> {
    const { username } = payload;

    if (!username) {
      throw new InvalidInputError('New username cannot be undefined');
    } else if (username === data.username) {
      throw new InvalidInputError(
        'Username cannot be the same as the older one',
      );
    }

    const user = UserFactory.toDomain(data);
    user.setUsername(username);

    const result = await this.userService.changeUsername(user);
    if (result) {
      const response = UserFactory.toResponse(user);

      await Promise.all([
        this.redisService.set(
          `user with ${user.getEmail.getValue}: `,
          response,
          7 * 24 * 60 * 60,
        ),

        this.redisService.set(
          `user with ${user.getId.getValue}: `,
          response,
          7 * 24 * 60 * 60,
        ),
      ]);

      return result;
    }

    return false;
  }
}
