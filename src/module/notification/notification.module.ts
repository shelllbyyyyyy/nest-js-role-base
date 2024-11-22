import { Module } from '@nestjs/common';
import { SendUserWelcome } from './application/use-case/send-user-wecome';
import { Tokenizer } from '@/shared/libs/tokenizer';
import { SearchService } from '@/shared/libs/elastic/search.service';

@Module({
  providers: [SendUserWelcome, Tokenizer, SearchService],
})
export class NotificationModule {}
