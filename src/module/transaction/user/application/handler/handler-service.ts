import { Injectable } from '@nestjs/common';

import { UserActionFactory } from '../factory/user-action-factory';
import { UserUpdate } from '@/shared/interface/update-payload';
import { UserResponse } from '../response/user.reposne';

@Injectable()
export class HandlerService {
  constructor(private readonly actionFactory: UserActionFactory) {}

  async handleUserAction(
    action: string,
    data: UserResponse,
    payload: UserUpdate,
  ): Promise<boolean> {
    const handler = this.actionFactory.getHandler(action);

    return await handler.handle(data, payload);
  }
}
