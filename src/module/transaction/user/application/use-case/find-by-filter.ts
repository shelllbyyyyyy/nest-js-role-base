import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';
import { Pagination } from '@/shared/interface/pagination-search.result';

import { UserResponse } from '../response/user.reponse';

import { UserFactory } from '../../domain/factories/user.factory';
import { UserService } from '../../domain/services/user.service';
import { Email } from '../../domain/value-object/email';
import { UserId } from '../../domain/value-object/userId';

import { FilterUserDTO } from '../../presentation/dto/filter-user.dto';

@Injectable()
export class FindByFilter
  implements IUseCase<FilterUserDTO, Pagination<UserResponse[]>>
{
  constructor(private readonly userService: UserService) {}

  async execute(data: FilterUserDTO): Promise<Pagination<UserResponse[]>> {
    const {
      email,
      is_verified,
      limit,
      order_by,
      userId,
      username,
      created_at,
      created_at_end,
      created_at_start,
      page,
    } = data;
    let userEmail: Email;
    let id: UserId;
    let offset: number = 0;
    let order: string;
    let name: string;

    if (email) {
      userEmail = new Email(email);
    }

    if (userId) {
      id = new UserId(userId);
    }

    if (page) {
      offset = (page - 1) * limit;
    }

    if (order_by) {
      order = order_by.split('-').join(' ');
    }

    if (username) {
      name = username.split('-').join(' ');
    }

    const user = await this.userService.findByFilter({
      id,
      email: userEmail,
      is_verified,
      limit,
      order_by: order,
      username: name,
      created_at,
      created_at_start,
      created_at_end,
      offset,
    });

    return {
      data: UserFactory.toResponses(user.data),
      total: user.total,
      limit: user.limit,
      page: user.page,
      total_pages: user.total_pages,
    };
  }
}
