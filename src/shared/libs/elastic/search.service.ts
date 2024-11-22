import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client, estypes } from '@elastic/elasticsearch';
import { ELASTIC_CONNECTION } from '../constant';

export class SearchService implements OnModuleDestroy, OnModuleInit {
  private readonly usersIndex = 'users';
  constructor(@Inject(ELASTIC_CONNECTION) private readonly esService: Client) {}

  async onModuleInit() {
    try {
      const indexExists = await this.esService.indices.exists({
        index: this.usersIndex,
      });

      if (!indexExists) {
        await this.esService.indices.create({
          index: this.usersIndex,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                username: { type: 'keyword' },
                email: { type: 'keyword' },
                password: { type: 'keyword', index: false },
                authorities: {
                  type: 'nested',
                  properties: {
                    id: { type: 'keyword' },
                    name: { type: 'keyword' },
                  },
                },
                provider: { type: 'keyword' },
                is_verified: { type: 'boolean' },
                created_at: {
                  type: 'date',
                  format: 'strict_date_optional_time||epoch_millis',
                },
              },
            },
          },
        });

        console.log('index created');
      }
    } catch (error) {
      console.error(`Error during Elasticsearch index setup:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.esService.close();
  }

  public async index<T>(index: string, document: T): Promise<any> {
    return await this.esService.index({ index, body: document });
  }

  async search<T, D>(
    index: string,
    query: estypes.QueryDslQueryContainer,
    offset: number,
    limit: number,
    sort: estypes.Sort,
  ): Promise<D> {
    try {
      const result = await this.esService.search<T>({
        index,
        from: offset ? offset : 0,
        size: limit,
        query,
        sort,
      });

      const total =
        typeof result.hits.total === 'number'
          ? result.hits.total
          : result.hits.total?.value;

      const final = {
        data: result.hits.hits.map((d) => d._source),
        total,
        limit: +limit,
        page: Math.floor(offset / +limit) + 1,
        total_pages: Math.ceil(total / limit),
      };

      return final as D;
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      throw error;
    }
  }

  async delete(
    index: string,
    query: estypes.QueryDslQueryContainer,
  ): Promise<any> {
    return await this.esService.deleteByQuery({ index, query });
  }

  async update(
    index: string,
    id: string,
    doc: Record<string, any>,
  ): Promise<any> {
    return await this.esService.update({
      index,
      id,
      doc,
    });
  }
}
