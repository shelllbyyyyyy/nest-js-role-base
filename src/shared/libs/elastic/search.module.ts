import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

import { SearchService } from './search.service';
import { ELASTIC_CONNECTION } from '../constant';

@Global()
@Module({
  providers: [
    {
      provide: ELASTIC_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('ELASTIC_NODE'),
        });
      },
      inject: [ConfigService],
    },
    SearchService,
  ],
  exports: [SearchService, ELASTIC_CONNECTION],
})
export class SearchModule {}
