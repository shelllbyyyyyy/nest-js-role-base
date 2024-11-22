import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Pagination } from '@/shared/interface/pagination-search.result';

import { SearchUserQuery } from './search-user.query';
import { UserResponse } from '../response/user.reponse';
import { UserFactory } from '../../domain/factories/user.factory';
import { UserService } from '../../domain/services/user.service';
import { Email } from '../../domain/value-object/email';
import { UserId } from '../../domain/value-object/userId';

@QueryHandler(SearchUserQuery)
export class SearchUserHandler
  implements IQueryHandler<SearchUserQuery, Pagination<UserResponse[]>>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: SearchUserQuery): Promise<Pagination<UserResponse[]>> {
    const email = query.email ? new Email(query.email) : null;
    const id = query.id ? new UserId(query.id) : null;
    let offset: number;
    const {
      created_at,
      created_at_end,
      created_at_start,
      is_verified,
      limit,
      page,
      order_by,
      username,
    } = query;

    if (page) {
      offset = (page - 1) * limit;
    }

    const domain = await this.userService.findByFilter({
      email,
      id,
      created_at,
      created_at_end,
      created_at_start,
      is_verified,
      limit,
      offset,
      order_by,
      username,
    });

    return {
      data: UserFactory.toResponses(domain.data),
      limit: domain.limit,
      page: domain.page,
      total: domain.total,
      total_pages: domain.total_pages,
    };
  }
}
