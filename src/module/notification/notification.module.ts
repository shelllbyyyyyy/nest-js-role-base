import { Module } from '@nestjs/common';
import { SendUserWelcome } from './application/use-case/send-user-wecome';
import { Tokenizer } from '@/shared/libs/tokenizer';

@Module({
  providers: [SendUserWelcome, Tokenizer],
})
export class NotificationModule {}
