import { UserActionFactory } from '../factory/user-action-factory';
import { ChangeEmail } from './change-email';
import { ChangePassword } from './change-password';
import { ChangeUsername } from './change-username';
import { HandlerService } from './handler-service';
import { UpdateAuthorities } from './update-authorities';
import { UpdateProvider } from './update-provider';
import { VerifyUser } from './verify-user';

export const UserServiceHandlers = [
  UserActionFactory,
  HandlerService,
  ChangeEmail,
  ChangePassword,
  ChangeUsername,
  UpdateAuthorities,
  UpdateProvider,
  VerifyUser,
];
