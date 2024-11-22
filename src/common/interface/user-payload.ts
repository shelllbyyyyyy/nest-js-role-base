import { RoleResponse } from '@/module/transaction/user/application/response/user.reponse';

export interface UserPayload {
  sub: string;
  email: string;
  authorities: RoleResponse[];
}
