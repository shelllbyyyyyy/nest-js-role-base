import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  mockRedisService,
  mockUserService,
  newProvider,
  newUser,
  provider,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { UserResponse } from '../../application/response/user.reponse';
import { UpdateProvider } from '../../application/handler/update-provider';
import { Provider } from '../../domain/value-object/provider';

describe('Update Provider Handler', () => {
  let userService: UserService;
  let redisService: RedisService;
  let updateProvider: UpdateProvider;

  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.provider = newProvider;

  const updateUser = newUser.clone();
  updateUser.setProvider(new Provider(newProvider));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProvider,
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
    updateProvider = module.get<UpdateProvider>(UpdateProvider);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(updateProvider).toBeDefined();
  });

  it('Should success update provider', async () => {
    mockUserService.updateProvider.mockResolvedValue(updateUser);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await updateProvider.handle(userResponse, userPayload);

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
    expect(mockUserService.updateProvider).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail update provider cause provider cannot be the same as the older one', async () => {
    mockUserService.updateProvider.mockResolvedValue(updateUser);

    await expect(
      updateProvider.handle(userResponse, {
        provider: provider,
      }),
    ).rejects.toThrow(
      new Error('New provider cannot be the same as the older one'),
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
    expect(mockUserService.updateProvider).not.toHaveBeenCalled();
  });

  it('Should fail Update Provider cause new provider undefined', async () => {
    mockUserService.updateProvider.mockResolvedValue(updateUser);

    await expect(
      updateProvider.handle(userResponse, {
        provider: undefined,
      }),
    ).rejects.toThrow(new Error('New provider cannot be undefined'));

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
    expect(mockUserService.updateProvider).not.toHaveBeenCalled();
  });
});
