import { Injectable } from '@nestjs/common';

import { IActionHandler } from '@/shared/interface/action-handler';
import { UserUpdate } from '@/shared/interface/update-payload';

import { ChangePassword } from '../handler/change-password';
import { UserResponse } from '../response/user.reposne';
import { VerifyUser } from '../handler/verify-user';
import { ChangeEmail } from '../handler/change-email';
import { ChangeUsername } from '../handler/change-username';
import { UpdateProvider } from '../handler/update-provider';
import { UpdateAuthorities } from '../handler/update-authorities';

@Injectable()
export class UserActionFactory {
  private readonly handlers: Record<
    string,
    IActionHandler<UserResponse, UserUpdate, boolean>
  >;

  constructor(
    private readonly changePassword: ChangePassword,
    private readonly changeEmail: ChangeEmail,
    private readonly changeUsername: ChangeUsername,
    private readonly updateProvider: UpdateProvider,
    private readonly updateAuthorities: UpdateAuthorities,
    private readonly verifyUser: VerifyUser,
  ) {
    this.handlers = {
      changePassword: this.changePassword,
      changeEmail: this.changeEmail,
      changeUsername: this.changeUsername,
      updateAuthorities: this.updateAuthorities,
      updateProvider: this.updateProvider,
      verifyUser: this.verifyUser,
    };
  }

  getHandler(action: string): IActionHandler<UserResponse, any, boolean> {
    const handler = this.handlers[action];
    if (!handler) {
      throw new Error(`No handler found for action: ${action}`);
    }

    return handler;
  }
}
