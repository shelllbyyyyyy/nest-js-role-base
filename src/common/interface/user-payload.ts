import { RoleResponse } from '@/module/transaction/user/application/response/user.reposne';

export interface UserPayload {
  sub: string;
  email: string;
  authorities: RoleResponse[];
}
