import { RoleEntity } from '../../module/transaction/user/domain/entities/role.entity';
import { UserEntity } from '../../module/transaction/user/domain/entities/user.entity';
import { Email } from '../../module/transaction/user/domain/value-object/email';
import { Provider as UserProvider } from '../../module/transaction/user/domain/enum/provider';
import { Provider } from '../../module/transaction/user/domain/value-object/provider';
import { UserId } from '../../module/transaction/user/domain/value-object/userId';
import { UserResponse } from '../../module/transaction/user/application/response/user.reposne';
import { ApiResponse } from '@/common/response/api';
import { HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';

const _id = randomUUID();
const id = new UserId(_id);
const username = 'Test';
const email = 'test123@gmail.com';
const password = '12345678';

const newUsername = 'New Test';
const newEmail = 'newtest123@gmail.com';
const newPassword = '123456789';

const hashedPassword = 'hash_password';
const invalidEmail = 'test123gmail.com';

const validEmail = new Email(email);

const role = new RoleEntity(1, 'USER');
const newRole = new RoleEntity(2, 'ADMIN');

const provider = new Provider(UserProvider.LOCAL);
const newProvider = new Provider(UserProvider.GOOGLE);

const authorities = new Set<RoleEntity>();
authorities.add(role);

const newUser = new UserEntity();
newUser.setId(id);
newUser.setUsername(username);
newUser.setEmail(validEmail);
newUser.setPassword(hashedPassword);
newUser.setAuthorities(authorities);
newUser.setProvider(provider);

const access_token = 'access_token';
const refresh_token = 'refresh_token';

const userResponse: UserResponse = {
  id: id.getValue,
  username,
  email,
  password: hashedPassword,
  authorities: newUser.getAuthorities.map((o) => {
    return {
      role_id: o.getId,
      authority: o.getAuthority,
    };
  }),
  provider: newUser.getProvider.getValue,
  is_verified: newUser.getIsVerified,
};

const payload = {
  sub: userResponse.id,
  email: userResponse.email,
  authorities: userResponse.authorities,
};

const mockRegisterUser = {
  execute: jest.fn(),
};

const mockFindByEmail = {
  execute: jest.fn(),
};

const mockFindById = {
  execute: jest.fn(),
};

const mockDeleteUser = {
  execute: jest.fn(),
};

const mockUserService = {
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  changePassword: jest.fn(),
  changeUsername: jest.fn(),
  changeEmail: jest.fn(),
  updateProvider: jest.fn(),
  updateAuthorities: jest.fn(),
  verifyUser: jest.fn(),
};

const mockRedisService = {
  del: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
};

const mockUserRepository = {
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  changePassword: jest.fn(),
  changeUsername: jest.fn(),
  changeEmail: jest.fn(),
  updateProvider: jest.fn(),
  updateAuthorities: jest.fn(),
  verifyUser: jest.fn(),
};

const mockBcryptService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

const mockTokenizer = {
  generateToken: jest.fn(),
  validateToken: jest.fn(),
  decodeToken: jest.fn(),
};

const findUserByEmailControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'User found',
  userResponse,
);

const deleteUserControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'Delete user success',
  true,
);

export {
  newUser,
  authorities,
  provider,
  invalidEmail,
  id,
  _id,
  username,
  email,
  password,
  role,
  newEmail,
  newPassword,
  newUsername,
  newRole,
  newProvider,
  validEmail,
  userResponse,
  hashedPassword,
  mockFindByEmail,
  mockFindById,
  mockDeleteUser,
  mockRegisterUser,
  mockRedisService,
  mockUserRepository,
  mockUserService,
  mockBcryptService,
  mockTokenizer,
  access_token,
  refresh_token,
  payload,
  findUserByEmailControllerResponse,
  deleteUserControllerResponse,
};
