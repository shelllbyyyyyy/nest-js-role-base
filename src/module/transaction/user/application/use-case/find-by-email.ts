import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserResponse } from '../response/user.reponse';

import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';
import { Email } from '../../domain/value-object/email';

@Injectable()
export class FindByEmail implements IUseCase<string, UserResponse | null> {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async execute(email: string): Promise<UserResponse | null> {
    const cache = await this.redisService.get<UserResponse>(
      `user with ${email}: `,
    );
    if (cache != null) return cache;

    const userEmail = new Email(email);
    const user = await this.userService.findByEmail(userEmail);

    if (!user) return null;

    const result = UserFactory.toResponse(user);

    if (user) {
      await this.redisService.set(
        `user with ${user.getEmail.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
    }

    return result;
  }
}
