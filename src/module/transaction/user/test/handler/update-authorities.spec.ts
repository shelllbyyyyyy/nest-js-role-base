import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@/shared/libs/redis/redis.service';

import {
  authorities,
  mockRedisService,
  mockUserService,
  newRole,
  newUser,
  role,
  userPayload,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { UserResponse } from '../../application/response/user.reponse';
import { UpdateAuthorities } from '../../application/handler/update-authorities';
import { RoleEntity } from '../../domain/entities/role.entity';

describe('Update authorities Handler', () => {
  let userService: UserService;
  let redisService: RedisService;
  let updateAuthorities: UpdateAuthorities;

  const newAuthorities = new Set<RoleEntity>();
  newAuthorities.add(role);
  newAuthorities.add(new RoleEntity(2, newRole));

  const updatedResponse: UserResponse = JSON.parse(
    JSON.stringify(userResponse),
  );
  updatedResponse.authorities.push({ role_id: 2, authority: newRole });

  const updateUser = newUser.clone();
  updateUser.setAuthorities(newAuthorities);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAuthorities,
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
    updateAuthorities = module.get<UpdateAuthorities>(UpdateAuthorities);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
    expect(updateAuthorities).toBeDefined();
  });

  it('Should success update authorities', async () => {
    mockUserService.updateAuthorities.mockResolvedValue(updateUser);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);
    mockRedisService.set.mockResolvedValueOnce(updatedResponse);

    const result = await updateAuthorities.handle(userResponse, userPayload);

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
    expect(mockUserService.updateAuthorities).toHaveBeenCalledWith(updateUser);
  });

  it('Should fail update authorities cause authorities cannot be the same as the older one', async () => {
    mockUserService.updateAuthorities.mockResolvedValue(updateUser);

    await expect(
      updateAuthorities.handle(userResponse, {
        role: 'USER',
      }),
    ).rejects.toThrow(
      new Error('New authorities cannot be the same as the older one'),
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
    expect(mockUserService.updateAuthorities).not.toHaveBeenCalled();
  });

  it('Should fail Update authorities cause new authorities undefined', async () => {
    mockUserService.updateAuthorities.mockResolvedValue(updateUser);

    await expect(
      updateAuthorities.handle(userResponse, {
        role: undefined,
      }),
    ).rejects.toThrow(new Error('New authorities cannot be undefined'));

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
    expect(mockUserService.updateAuthorities).not.toHaveBeenCalled();
  });
});
