import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { UserResponse } from '@/module/transaction/user/application/response/user.reponse';
import { IUseCase } from '@/shared/interface/use-case';
import { EmailService } from '@/shared/libs/mailer/mailer.service';
import { Tokenizer } from '@/shared/libs/tokenizer';
import { SearchService } from '@/shared/libs/elastic/search.service';

@Injectable()
export class SendUserWelcome implements IUseCase<UserResponse, void> {
  constructor(
    private readonly mailService: EmailService,
    private readonly tokenizer: Tokenizer,
    private readonly searchService: SearchService,
  ) {}

  @OnEvent('user.created', { async: true })
  async execute(data: UserResponse): Promise<void> {
    const token = await this.tokenizer.generateToken(
      { email: data.email },
      '1m',
    );

    await Promise.all([
      this.mailService.sendUserWelcome(data, token),
      this.searchService.index('users', data),
    ]);
  }
}
