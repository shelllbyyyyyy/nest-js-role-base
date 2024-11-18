import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { ChainableCommander, RedisKey } from 'ioredis';

import { REDIS_CONNECTION } from '../constant';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  async onModuleDestroy() {
    this.redis.disconnect();
  }

  async set<T>(key: RedisKey, value: T, exp: number) {
    const json = JSON.stringify(value);

    return await this.redis.set(key, json, 'EX', exp, (err, data) => {
      if (err || !data) this.logger.warn(err);
    });
  }

  async get<T>(key: RedisKey): Promise<T> {
    const result = await this.redis.get(key, (err, data) => {
      if (err || !data) this.logger.warn(err);
    });

    return JSON.parse(result) as T;
  }

  async del(key: RedisKey) {
    return await this.redis.del(key);
  }

  async pipeline() {
    return this.redis.pipeline();
  }

  async exec(data: ChainableCommander) {
    await data.exec();
  }
}
