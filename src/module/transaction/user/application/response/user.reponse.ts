export type UserResponse = {
  id: string;
  username: string;
  email: string;
  password: string;
  authorities: RoleResponse[];
  provider: string;
  is_verified: boolean;
};

export type RoleResponse = {
  role_id: number;
  authority: string;
};
