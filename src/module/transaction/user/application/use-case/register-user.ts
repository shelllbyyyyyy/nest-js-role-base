import { Injectable } from '@nestjs/common';

import { RegisterDTO } from '@/module/auth/presentation/dto/register.dto';
import { IUseCase } from '@/shared/interface/use-case';
import { RedisService } from '@/shared/libs/redis/redis.service';
import { BcryptService } from '@/shared/libs/bcrypt';

import { UserResponse } from '../response/user.reposne';
import { Email } from '../../domain/value-object/email';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserService } from '../../domain/services/user.service';

@Injectable()
export class RegisterUser implements IUseCase<RegisterDTO, UserResponse> {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async execute(data: RegisterDTO): Promise<UserResponse> {
    const email = new Email(data.email);
    const hashPassword = await this.bcryptService.hashPassword(data.password);

    const user = await this.userService.createUser(
      data.username,
      email,
      hashPassword,
    );

    const result = UserFactory.toResponse(user);

    if (user != null) {
      await Promise.all([
        this.redisService.set(
          `user with ${user.getEmail.getValue}: `,
          result,
          7 * 24 * 60 * 60,
        ),

        this.redisService.set(
          `user with ${user.getId.getValue}: `,
          result,
          7 * 24 * 60 * 60,
        ),
      ]);
    }

    return result;
  }
}
