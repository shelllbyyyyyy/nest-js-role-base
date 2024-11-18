import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './shared/libs/pg/database.module';
import { ConfigModule } from './shared/module';

@Module({
  imports: [EventEmitterModule.forRoot(), ConfigModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
