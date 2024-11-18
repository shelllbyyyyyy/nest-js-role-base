import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CONNECTION } from '../constant';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('DB_REDIS_HOST'),
          port: configService.get<number>('DB_REDIS_PORT'),
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CONNECTION, RedisService],
})
export class RedisModule {}
