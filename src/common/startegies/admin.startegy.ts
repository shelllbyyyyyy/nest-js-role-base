import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { publicKey } from '@/shared/module';
import { RoleResponse } from '@/module/transaction/user/application/response/user.reposne';

import { UserPayload } from '../interface/user-payload';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: publicKey,
    });
  }

  async validate(payload: UserPayload) {
    const admin = payload.authorities.find(
      (i: RoleResponse) => i.authority === 'ADMIN',
    );

    if (!admin) throw new UnauthorizedException('Only admin can access this');

    return {
      sub: payload.sub,
      email: payload.email,
      authorities: payload.authorities,
    };
  }
}
