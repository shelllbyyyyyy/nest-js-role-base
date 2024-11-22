import { Injectable } from '@nestjs/common';
import { estypes } from '@elastic/elasticsearch';

import { Pagination } from '@/shared/interface/pagination-search.result';
import { SearchService } from '@/shared/libs/elastic/search.service';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-object/email';
import { UserId } from '../../../domain/value-object/userId';
import { Filter } from '../../../domain/services/user.service';
import { UserResponse } from '../../../application/response/user.reponse';
import { UserFactory } from '../../../domain/factories/user.factory';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  index = 'users';
  constructor(private readonly searchService: SearchService) {}

  async findAll(): Promise<UserEntity[]> {
    return;
  }

  async save(_data: UserEntity): Promise<UserEntity> {
    return;
  }

  async findByEmail(_email: Email): Promise<UserEntity | null> {
    return;
  }

  async findById(_id: UserId): Promise<UserEntity | null> {
    return;
  }

  async delete(_data: UserEntity): Promise<boolean> {
    return;
  }

  async update(_data: UserEntity): Promise<boolean> {
    return;
  }

  async changeEmail(_data: UserEntity): Promise<boolean> {
    return;
  }

  async changeUsername(_data: UserEntity): Promise<boolean> {
    return;
  }

  async changePassword(_data: UserEntity): Promise<boolean> {
    return;
  }

  async updateAuthorities(_data: UserEntity): Promise<boolean> {
    return;
  }

  async updateProvider(_data: UserEntity): Promise<boolean> {
    return;
  }

  async verifyUser(_data: UserEntity): Promise<boolean> {
    return;
  }

  async filterBy(data: Filter): Promise<any> {
    const sort: Record<string, string> = {};

    if (data.order_by) {
      const eek = data.order_by.split('-');
      const sortField = eek[0];
      const sortOrder = eek[1].toLowerCase();
      sort[sortField] = sortOrder;
    }

    const query: any = {
      bool: {
        should: [],
        filter: [],
      },
    };

    if (data.created_at_start && data.created_at_end) {
      query.bool.filter.push({
        range: {
          created_at: {
            gte: data.created_at_start,
            lte: data.created_at_end,
          },
        },
      });
    }

    if (data.id) {
      query.bool.should.push({
        match: { id: data.id.getValue },
      });
    }

    if (data.username) {
      query.bool.should.push({
        wildcard: { username: { value: `${data.username}*` } },
      });
    }

    if (data.email) {
      query.bool.should.push({
        match: { email: data.email.getValue },
      });
    }

    if (data.is_verified !== undefined) {
      query.bool.filter.push({
        term: { is_verified: data.is_verified },
      });
    }

    const defaultLimit = 10;
    const defaultOffset = 0;

    const search = await this.searchService.search<
      UserResponse[],
      Pagination<UserResponse[]>
    >(
      this.index,
      query as estypes.QueryDslQueryContainer,
      data.offset ? data.offset : defaultOffset,
      data.limit ? data.limit : defaultLimit,
      sort,
    );

    return {
      data: UserFactory.toDomains(search.data),
      page: search.page,
      limit: search.limit,
      total: search.total,
      total_pages: search.total_pages,
    };
  }
}
