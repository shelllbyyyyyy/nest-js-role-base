import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { compare, hash } from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.configService.get<number>('SALT_BCRYPT'));
  }

  async comparePassword(
    inputPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    return await compare(inputPassword, dbPassword);
  }
}
