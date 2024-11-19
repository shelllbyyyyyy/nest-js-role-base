import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TransactionModule } from './module/transaction/transaction.module';
import { AuthModule } from './module/auth/auth.module';

import { RedisModule } from './shared/libs/redis/redis.module';
import { DatabaseModule } from './shared/libs/pg/database.module';
import { MailerModule } from './shared/libs/mailer/mailer.module';
import { ConfigModule, JwtModule } from './shared/module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule,
    TransactionModule,
    AuthModule,
    JwtModule,
    RedisModule,
    DatabaseModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
