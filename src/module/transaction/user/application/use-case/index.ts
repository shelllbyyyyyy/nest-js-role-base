import { DeleteUser } from './delete-user';
import { FindAll } from './find-all';
import { FindByEmail } from './find-by-email';
import { FindByFilter } from './find-by-filter';
import { FindById } from './find-by-id';
import { OAuth } from './oauth';
import { RegisterUser } from './register-user';

export const UserServiceUseCases = [
  FindAll,
  FindByEmail,
  FindByFilter,
  RegisterUser,
  OAuth,
  FindById,
  DeleteUser,
];
