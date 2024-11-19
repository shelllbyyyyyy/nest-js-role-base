import { Injectable } from '@nestjs/common';

import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserResponse } from '../response/user.reposne';
import { InvalidInputError } from '@/common/exceptions/invalid-input.error';

@Injectable()
export class VerifyUser
  implements IActionHandler<UserResponse, UserUpdate, boolean>
{
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async handle(data: UserResponse, payload: UserUpdate): Promise<boolean> {
    const { is_verified } = payload;

    if (is_verified === undefined) {
      throw new InvalidInputError('New value cannot be undefined');
    } else if (is_verified === data.is_verified) {
      throw new InvalidInputError(
        'New value cannot be the same as the older one',
      );
    }

    const user = UserFactory.toDomain(data);
    user.setIsVerified(is_verified);

    const result = await this.userService.verifyUser(user);
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
