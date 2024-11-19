import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  email,
  mockBcryptService,
  mockRedisService,
  mockUserService,
  newEmail,
  newUser,
  password,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { ChangeEmail } from '../../application/handler/change-email';
import { Email } from '../../domain/value-object/email';
import { UserResponse } from '../../application/response/user.reposne';

describe('Change Email Handler', () => {
  let userService: UserService;
  let bcryptService: BcryptService;
  let redisService: RedisService;
  let changeEmail: ChangeEmail;

  const emails = new Email(newEmail);
  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.email = newEmail;

  const updateUser = newUser.clone();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeEmail,
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
    changeEmail = module.get<ChangeEmail>(ChangeEmail);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(changeEmail).toBeDefined();
  });

  it('Should success change email', async () => {
    updateUser.setEmail(emails);

    mockBcryptService.comparePassword.mockResolvedValue(true);
    mockUserService.changeEmail.mockResolvedValue(true);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await changeEmail.handle(userResponse, userPayload);

    expect(result).toBeTruthy();
    expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
    );
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
    expect(mockUserService.changeEmail).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change email cause password not match', async () => {
    updateUser.setEmail(emails);

    mockBcryptService.comparePassword.mockResolvedValue(false);
    mockUserService.changeEmail.mockResolvedValue(false);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    await expect(
      changeEmail.handle(userResponse, {
        email: newEmail,
        current_password: '1234567890',
      }),
    ).rejects.toThrow(new Error('Password not match'));

    expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
      '1234567890',
      userResponse.password,
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
    expect(mockUserService.changeEmail).not.toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change email cause email cannot be the same as the older one', async () => {
    mockBcryptService.comparePassword.mockResolvedValue(false);
    mockUserService.changeEmail.mockResolvedValue(false);

    await expect(
      changeEmail.handle(userResponse, {
        email: email,
        current_password: password,
      }),
    ).rejects.toThrow(new Error('Email cannot be the same as the older one'));

    expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
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
    expect(mockUserService.changeEmail).not.toHaveBeenCalled();
  });

  it('Should fail change email cause email/password undefined', async () => {
    mockBcryptService.comparePassword.mockResolvedValue(true);
    mockUserService.changeEmail.mockResolvedValue(false);

    await expect(
      changeEmail.handle(userResponse, {
        email: undefined,
        current_password: undefined,
      }),
    ).rejects.toThrow(new Error('New email/old password cannot be undefined'));

    expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
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
    expect(mockUserService.changeEmail).not.toHaveBeenCalled();
  });

  it('Should fail change email cause email not valid', async () => {
    mockBcryptService.comparePassword.mockResolvedValue(true);
    mockUserService.changeEmail.mockResolvedValue(false);

    await expect(
      changeEmail.handle(userResponse, {
        email: 'test123',
        current_password: password,
      }),
    ).rejects.toThrow(new Error('Invalid email format'));

    expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
      userPayload.current_password,
      userResponse.password,
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
    expect(mockUserService.changeEmail).not.toHaveBeenCalledWith(updateUser);
  });
});
