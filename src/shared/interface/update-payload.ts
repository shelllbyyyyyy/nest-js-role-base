export type UserUpdate = {
  current_password?: string;
  email?: string;
  username?: string;
  password?: string;
  is_verified?: boolean;
  role?: string;
  provider?: string;
};
