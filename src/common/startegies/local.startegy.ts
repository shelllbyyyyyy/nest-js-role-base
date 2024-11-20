import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { FindByEmail } from '@/module/transaction/user/application/use-case/find-by-email';
import { BcryptService } from '@/shared/libs/bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly findByEmail: FindByEmail,
    private readonly bcryptService: BcryptService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.findByEmail.execute(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const compare = await this.bcryptService.comparePassword(
      password,
      user.password,
    );

    if (!compare) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
