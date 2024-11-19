import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/interface/use-case';

import { UserResponse } from '../response/user.reposne';
import { UserService } from '../../domain/services/user.service';
import { UserFactory } from '../../domain/factories/user.factory';

@Injectable()
export class FindAll implements IUseCase<undefined, UserResponse[]> {
  constructor(private readonly userService: UserService) {}

  async execute(): Promise<UserResponse[]> {
    const users = await this.userService.findAll();

    if (users.length == 0) return [];

    return UserFactory.toResponses(users);
  }
}
