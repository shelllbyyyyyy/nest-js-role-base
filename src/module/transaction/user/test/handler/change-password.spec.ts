import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  hashedPassword,
  mockBcryptService,
  mockRedisService,
  mockUserService,
  newPassword,
  newUser,
  password,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { ChangePassword } from '../../application/handler/change-password';
import { UserResponse } from '../../application/response/user.reposne';

describe('Change Password Handler', () => {
  let userService: UserService;
  let bcryptService: BcryptService;
  let redisService: RedisService;
  let changePassword: ChangePassword;

  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.password = hashedPassword;

  const updateUser = newUser.clone();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePassword,
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    userService = module.get<UserService>(UserService);
    bcryptService = module.get<BcryptService>(BcryptService);
    changePassword = module.get<ChangePassword>(ChangePassword);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(changePassword).toBeDefined();
  });

  it('Should success change password', async () => {
    updateUser.setPassword(hashedPassword);

    mockBcryptService.comparePassword.mockResolvedValue(true);
    mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
    mockUserService.changePassword.mockResolvedValue(true);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await changePassword.handle(userResponse, userPayload);

    expect(result).toBeTruthy();
    expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
    );
    expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(newPassword);
    expect(mockRedisService.set).toHaveBeenCalledTimes(2);
    expect(mockRedisService.set).toHaveBeenNthCalledWith(
      1,
      `user with ${updatedResponse.email}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockRedisService.set).toHaveBeenNthCalledWith(
      2,
      `user with ${updatedResponse.id}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockUserService.changePassword).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change password cause password not match', async () => {
    updateUser.setPassword(newPassword);

    mockBcryptService.comparePassword.mockResolvedValue(false);
    mockUserService.changePassword.mockResolvedValue(false);

    await expect(
      changePassword.handle(userResponse, {
        password: newPassword,
        current_password: '1234567890',
      }),
    ).rejects.toThrow(new Error('Password not match'));

    expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
      '1234567890',
      userResponse.password,
    );
    expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(
      newPassword,
    );
    expect(mockRedisService.set).not.toHaveBeenCalledTimes(2);
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      1,
      `user with ${updatedResponse.email}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      2,
      `user with ${updatedResponse.id}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockUserService.changePassword).not.toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change password cause password cannot be the same as the older one', async () => {
    mockBcryptService.comparePassword.mockResolvedValue(false);
    mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
    mockUserService.changePassword.mockResolvedValue(false);

    await expect(
      changePassword.handle(userResponse, {
        password: password,
        current_password: password,
      }),
    ).rejects.toThrow(
      new Error('Password cannot be the same as the older one'),
    );

    expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
    );
    expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(
      newPassword,
    );
    expect(mockRedisService.set).not.toHaveBeenCalledTimes(2);
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      1,
      `user with ${updatedResponse.email}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      2,
      `user with ${updatedResponse.id}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockUserService.changePassword).not.toHaveBeenCalled();
  });

  it('Should fail change password cause newPassword/current password undefined', async () => {
    mockBcryptService.comparePassword.mockResolvedValue(true);
    mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
    mockUserService.changePassword.mockResolvedValue(false);

    await expect(
      changePassword.handle(userResponse, {
        password: undefined,
        current_password: undefined,
      }),
    ).rejects.toThrow(
      new Error('New password/old password cannot be undefined'),
    );

    expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
    );
    expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(
      newPassword,
    );
    expect(mockRedisService.set).not.toHaveBeenCalledTimes(2);
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      1,
      `user with ${updatedResponse.email}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
      2,
      `user with ${updatedResponse.id}: `,
      updatedResponse,
      7 * 24 * 60 * 60,
    );
    expect(mockUserService.changePassword).not.toHaveBeenCalled();
  });
});
