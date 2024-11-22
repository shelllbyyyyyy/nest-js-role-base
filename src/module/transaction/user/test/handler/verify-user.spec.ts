import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  mockRedisService,
  mockUserService,
  newUser,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { UserResponse } from '../../application/response/user.reponse';
import { VerifyUser } from '../../application/handler/verify-user';

describe('Verify User Handler', () => {
  let userService: UserService;
  let redisService: RedisService;
  let verifyUser: VerifyUser;

  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.is_verified = true;

  const updateUser = newUser.clone();
  updateUser.setIsVerified(true);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyUser,
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
    verifyUser = module.get<VerifyUser>(VerifyUser);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(VerifyUser).toBeDefined();
  });

  it('Should success change Value', async () => {
    mockUserService.verifyUser.mockResolvedValue(true);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await verifyUser.handle(userResponse, userPayload);

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
    expect(mockUserService.verifyUser).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail change value cause value cannot be the same as the older one', async () => {
    mockUserService.verifyUser.mockResolvedValue(false);

    await expect(
      verifyUser.handle(userResponse, {
        is_verified: false,
      }),
    ).rejects.toThrow(
      new Error('New value cannot be the same as the older one'),
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
    expect(mockUserService.verifyUser).not.toHaveBeenCalled();
  });

  it('Should fail verify user cause new value undefined', async () => {
    mockUserService.verifyUser.mockResolvedValue(false);

    await expect(
      verifyUser.handle(userResponse, {
        is_verified: undefined,
      }),
    ).rejects.toThrow(new Error('New value cannot be undefined'));

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
    expect(mockUserService.verifyUser).not.toHaveBeenCalled();
  });
});
