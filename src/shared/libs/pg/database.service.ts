import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

import { PG_CONNECTION } from '../constant';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<any> = await client.query(text, params);

      return result;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async transactions(
    queries: { text: string; params: any[] }[],
  ): Promise<QueryResult<any>[]> {
    const client = await this.pool.connect();
    const results: QueryResult<any>[] = [];

    try {
      await client.query('BEGIN');

      for (const query of queries) {
        const result = await client.query(query.text, query.params);

        results.push(result);
      }

      await client.query('COMMIT');

      return results;
    } catch (error) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }
}
