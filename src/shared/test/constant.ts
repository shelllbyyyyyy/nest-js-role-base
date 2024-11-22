import { HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ApiResponse, ApiResponsePagination } from '@/common/response/api';
import { UserPayload } from '@/common/interface/user-payload';

import { RoleEntity } from '../../module/transaction/user/domain/entities/role.entity';
import { UserEntity } from '../../module/transaction/user/domain/entities/user.entity';
import { Email } from '../../module/transaction/user/domain/value-object/email';
import { Provider as UserProvider } from '../../module/transaction/user/domain/enum/provider';
import { Provider } from '../../module/transaction/user/domain/value-object/provider';
import { UserId } from '../../module/transaction/user/domain/value-object/userId';
import { UserResponse } from '../../module/transaction/user/application/response/user.reposne';

import { UserUpdate } from '../interface/update-payload';

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
const newRole = 'ADMIN';

const provider: UserProvider = <UserProvider>'local';
const newProvider: UserProvider = <UserProvider>'google';

const userProvider = new Provider(newProvider);

const authorities = new Set<RoleEntity>();
authorities.add(role);

const newUser = new UserEntity();
newUser.setId(id);
newUser.setUsername(username);
newUser.setEmail(validEmail);
newUser.setPassword(hashedPassword);
newUser.setAuthorities(authorities);
newUser.setProvider(new Provider(provider));

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

const userPayload: UserUpdate = {
  current_password: password,
  email: newEmail,
  is_verified: true,
  password: newPassword,
  provider: newProvider,
  role: newRole,
  username: newUsername,
};

const copyUser = newUser.clone();
copyUser.setIsVerified(true);
copyUser.setProvider(userProvider);

const copyUserResponse = deepCopy(userResponse);
copyUserResponse.is_verified = true;
copyUserResponse.provider = newProvider;

const currentUser: UserPayload = {
  sub: _id,
  email,
  authorities: newUser.getAuthorities.map((o) => {
    return {
      role_id: o.getId,
      authority: o.getAuthority,
    };
  }),
};

const paginationUserEntity = {
  data: [newUser, newUser],
  total: 2,
  limit: 5,
  page: 1,
  total_pages: 1,
};

const paginationUserResponse = {
  data: [userResponse, userResponse],
  total: 2,
  limit: 5,
  page: 1,
  total_pages: 1,
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
  createUserOAuth: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  changePassword: jest.fn(),
  changeUsername: jest.fn(),
  changeEmail: jest.fn(),
  updateProvider: jest.fn(),
  updateAuthorities: jest.fn(),
  verifyUser: jest.fn(),
  findByFilter: jest.fn(),
};

const mockRedisService = {
  del: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
};

const mockUserRepository = {
  finadAll: jest.fn(),
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  changePassword: jest.fn(),
  changeUsername: jest.fn(),
  changeEmail: jest.fn(),
  updateProvider: jest.fn(),
  updateAuthorities: jest.fn(),
  verifyUser: jest.fn(),
  filterBy: jest.fn(),
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

const findAllUserControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'Users found',
  [userResponse, userResponse],
);

const deleteUserControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'Delete user success',
  true,
);

const updateUserControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'User updated',
  true,
);

const registerUserControllerResponse = new ApiResponse(
  HttpStatus.CREATED,
  'Register Successfully',
  userResponse,
);

const loginUserControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'Login Successfully',
  null,
);

const oAuthControllerResponse = new ApiResponse(
  HttpStatus.OK,
  'OAuth success',
  null,
);

const findAllUserControllerResponsePagination = new ApiResponsePagination(
  HttpStatus.OK,
  'Users found',
  [userResponse, userResponse],
  2,
  5,
  1,
  1,
);

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

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
  userPayload,
  currentUser,
  findUserByEmailControllerResponse,
  deleteUserControllerResponse,
  updateUserControllerResponse,
  registerUserControllerResponse,
  loginUserControllerResponse,
  deepCopy,
  userProvider,
  copyUserResponse,
  copyUser,
  oAuthControllerResponse,
  findAllUserControllerResponse,
  findAllUserControllerResponsePagination,
  paginationUserEntity,
  paginationUserResponse,
};
