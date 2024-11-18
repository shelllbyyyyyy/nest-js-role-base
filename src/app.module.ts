import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RedisModule } from './shared/libs/redis/redis.module';
import { DatabaseModule } from './shared/libs/pg/database.module';
import { ConfigModule, JwtModule } from './shared/module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule,
    JwtModule,
    RedisModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
