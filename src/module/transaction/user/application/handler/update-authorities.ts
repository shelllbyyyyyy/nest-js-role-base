import { Injectable } from '@nestjs/common';

import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { RoleResponse, UserResponse } from '../response/user.reponse';
import { RoleEntity } from '../../domain/entities/role.entity';
import { InvalidInputError } from '@/common/exceptions/invalid-input.error';

@Injectable()
export class UpdateAuthorities
  implements IActionHandler<UserResponse, UserUpdate, boolean>
{
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async handle(data: UserResponse, payload: UserUpdate): Promise<boolean> {
    const { role } = payload;

    if (!role) {
      throw new InvalidInputError('New authorities cannot be undefined');
    } else if (role === data.authorities[0].authority) {
      throw new InvalidInputError(
        'New authorities cannot be the same as the older one',
      );
    }

    const roles = data.authorities;
    roles.push({ role_id: 2, authority: role });

    const authorities = new Set<RoleEntity>();
    roles.map((r: RoleResponse) =>
      authorities.add(new RoleEntity(r.role_id, r.authority)),
    );

    const user = UserFactory.toDomain(data);
    user.setAuthorities(authorities);

    const result = await this.userService.updateAuthorities(user);
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
