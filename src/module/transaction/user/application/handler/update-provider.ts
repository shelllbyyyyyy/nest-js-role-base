import { Injectable } from '@nestjs/common';

import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserResponse } from '../response/user.reposne';
import { Provider } from '../../domain/value-object/provider';
import { InvalidInputError } from '@/common/exceptions/invalid-input.error';

@Injectable()
export class UpdateProvider
  implements IActionHandler<UserResponse, UserUpdate, boolean>
{
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async handle(data: UserResponse, payload: UserUpdate): Promise<boolean> {
    const { provider } = payload;

    if (!provider) {
      throw new InvalidInputError('New provider cannot be undefined');
    } else if (provider === data.provider) {
      throw new InvalidInputError(
        'New provider cannot be the same as the older one',
      );
    }

    const newProvider = new Provider(provider);

    const user = UserFactory.toDomain(data);
    user.setProvider(newProvider);

    const result = await this.userService.updateProvider(user);
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
