import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class Tokenizer {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any, expiresIn: string | number) {
    return await this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }

  async verifyToken(token: string) {
    return await this.jwtService.verifyAsync(token);
  }

  async decodeToken(token: string) {
    return await this.jwtService.decode(token);
  }
}
