import { Injectable } from '@nestjs/common';

import { InvalidInputError } from '@/common/exceptions/invalid-input.error';
import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';
import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserResponse } from '../response/user.reposne';

@Injectable()
export class ChangePassword
  implements IActionHandler<UserResponse, UserUpdate, boolean>
{
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly bcryptService: BcryptService,
  ) {}

  async handle(data: UserResponse, payload: UserUpdate): Promise<boolean> {
    const { password, current_password } = payload;

    if (!password || !current_password) {
      throw new InvalidInputError(
        'New password/old password cannot be undefined',
      );
    } else if (password === current_password) {
      throw new InvalidInputError(
        'Password cannot be the same as the older one',
      );
    }

    const compare = await this.bcryptService.comparePassword(
      current_password,
      data.password,
    );
    if (!compare) throw new InvalidInputError('Password not match');

    const hash_password = await this.bcryptService.hashPassword(password);

    const user = UserFactory.toDomain(data);
    user.setPassword(hash_password);

    const result = await this.userService.changePassword(user);
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
