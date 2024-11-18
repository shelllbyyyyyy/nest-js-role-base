import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { DatabaseService } from './database.service';
import { PG_CONNECTION } from '../constant';

@Global()
@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
        });
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: [PG_CONNECTION, DatabaseService],
})
export class DatabaseModule {}
