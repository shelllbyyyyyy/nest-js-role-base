import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';
import { RedisService } from '@/shared/libs/redis/redis.service';
import { BcryptService } from '@/shared/libs/bcrypt';

import { UserResponse } from '../response/user.reponse';
import { Email } from '../../domain/value-object/email';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserService } from '../../domain/services/user.service';
import { Provider as UserProvider } from '../../domain/enum/provider';
import { Provider } from '../../domain/value-object/provider';
import { RoleEntity } from '../../domain/entities/role.entity';

type OAuthDTO = {
  username: string;
  email: string;
  password: string;
  provider: string;
};

@Injectable()
export class OAuth implements IUseCase<OAuthDTO, UserResponse> {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async execute(data: OAuthDTO): Promise<UserResponse> {
    const email = new Email(data.email);
    const userProvider = <UserProvider>data.provider;
    const provider = new Provider(userProvider);
    const authorities = new Set<RoleEntity>();
    authorities.add(new RoleEntity(1, 'USER'));

    const hashPassword = await this.bcryptService.hashPassword(data.password);

    const user = await this.userService.createUserOAuth(
      data.username,
      email,
      hashPassword,
      provider,
      authorities,
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
