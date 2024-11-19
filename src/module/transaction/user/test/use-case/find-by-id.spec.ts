import { Test, TestingModule } from '@nestjs/testing';

import {
  _id,
  id,
  mockRedisService,
  mockUserService,
  newUser,
  userResponse,
} from '@/shared/test/constant';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { FindById } from '../../application/use-case/find-by-id';
import { UserService } from '../../domain/services/user.service';

describe('Find By Id', () => {
  let findById: FindById;
  let userService: UserService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindById,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    findById = module.get<FindById>(FindById);
    userService = module.get<UserService>(UserService);
    redisService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(findById).toBeDefined();
    expect(userService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('Find By Id Use Case', () => {
    it('Should return user response success without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findById.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);

      const result = await findById.execute(_id);

      expect(result).toEqual(userResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).toHaveBeenCalledWith(id);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should return user response success with redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);

      const result = await findById.execute(_id);

      expect(result).toEqual(userResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).not.toHaveBeenCalledWith(id);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should throw an exception bad request User not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findById.mockResolvedValue(null);

      const result = await findById.execute(_id);

      expect(result).toBeNull();
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).toHaveBeenCalledWith(id);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should throw an exception Invalid id format', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(findById.execute('test')).rejects.toThrow(
        new Error('Invalid UUID format'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with test: `);
    });
  });
});
