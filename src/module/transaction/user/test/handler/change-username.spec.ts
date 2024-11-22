import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  mockRedisService,
  mockUserService,
  newUser,
  newUsername,
  username,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { ChangeUsername } from '../../application/handler/change-username';
import { UserResponse } from '../../application/response/user.reponse';

describe('Change username Handler', () => {
  let userService: UserService;
  let redisService: RedisService;
  let changeUsername: ChangeUsername;

  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.username = newUsername;

  const updateUser = newUser.clone();
  updateUser.setUsername(newUsername);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeUsername,
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
    changeUsername = module.get<ChangeUsername>(ChangeUsername);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(changeUsername).toBeDefined();
  });

  it('Should success change username', async () => {
    mockUserService.changeUsername.mockResolvedValue(updateUser);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await changeUsername.handle(userResponse, userPayload);

    expect(result).toBeTruthy();
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
    expect(mockUserService.changeUsername).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change username cause username cannot be the same as the older one', async () => {
    mockUserService.changeUsername.mockResolvedValue(updateUser);

    await expect(
      changeUsername.handle(userResponse, {
        username: username,
      }),
    ).rejects.toThrow(
      new Error('Username cannot be the same as the older one'),
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
    expect(mockUserService.changeUsername).not.toHaveBeenCalled();
  });

  it('Should fail change username cause newusername/current username undefined', async () => {
    mockUserService.changeUsername.mockResolvedValue(updateUser);

    await expect(
      changeUsername.handle(userResponse, {
        username: undefined,
      }),
    ).rejects.toThrow(new Error('New username cannot be undefined'));

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
    expect(mockUserService.changeUsername).not.toHaveBeenCalled();
  });
});
