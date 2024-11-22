import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TransactionModule } from './module/transaction/transaction.module';
import { NotificationModule } from './module/notification/notification.module';
import { AuthModule } from './module/auth/auth.module';

import { RedisModule } from './shared/libs/redis/redis.module';
import { DatabaseModule } from './shared/libs/pg/database.module';
import { MailerModule } from './shared/libs/mailer/mailer.module';
import { ConfigModule, JwtModule, ThrottleModule } from './shared/module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { SearchModule } from './shared/libs/elastic/search.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        throttlers: [{ ttl: 1, limit: 2 }],
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    TransactionModule,
    NotificationModule,
    AuthModule,
    JwtModule,
    RedisModule,
    DatabaseModule,
    MailerModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
