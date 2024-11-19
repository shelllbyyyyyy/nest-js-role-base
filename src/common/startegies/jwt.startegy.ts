import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { publicKey } from '@/shared/module';

import { UserPayload } from '../interface/user-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
    return {
      sub: payload.sub,
      email: payload.email,
      authorities: payload.authorities,
    };
  }
}
