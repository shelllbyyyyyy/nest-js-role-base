import { Injectable } from '@nestjs/common';

import { UserPayload } from '@/common/interface/user-payload';
import { UserResponse } from '@/module/transaction/user/application/response/user.reposne';
import { IUseCase } from '@/shared/interface/use-case';
import { Tokenizer } from '@/shared/libs/tokenizer';

import { JwtResponse } from '../response/jwt-response';

@Injectable()
export class GenerateJwtToken
  implements IUseCase<UserResponse, JwtResponse | null>
{
  constructor(private readonly tokenizer: Tokenizer) {}

  async execute(data: UserResponse): Promise<JwtResponse | null> {
    if (!data) return null;

    const payload: UserPayload = {
      sub: data.id,
      email: data.email,
      authorities: data.authorities,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.tokenizer.generateToken(payload, '1h'),
      this.tokenizer.generateToken(payload, '7d'),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
