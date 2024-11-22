import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';

import { UserEntity as User } from '@/module/transaction/user/domain/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserResponse } from '@/module/transaction/user/application/response/user.reponse';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserWelcome(user: UserResponse, token: string) {
    const confirmation_url = `${this.configService.get('CLIENT_URL')}/auth/activate-account/${user.email}/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: `no-reply ${this.configService.get('EMAIL_ADMIN')}`,
      subject: 'Welcome to Shelby shop! Confirm your Email',
      template: './verify-account',
      context: {
        name: user.username,
        confirmation_url,
      },
    });
  }

  async resendVerificationUser(user: UserResponse, token: string) {
    const confirmation_url = `${this.configService.get('CLIENT_URL')}/auth/resend-verification/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: `no-reply ${this.configService.get('EMAIL_ADMIN')}`,
      subject: 'Welcome to Shelby Shop! Confirm your Email',
      template: './resend-verification',
      context: {
        name: user.username,
        confirmation_url,
      },
    });
  }
}
