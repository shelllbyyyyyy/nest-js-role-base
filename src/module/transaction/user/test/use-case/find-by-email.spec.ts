import { Test, TestingModule } from '@nestjs/testing';

import {
  email,
  id,
  mockRedisService,
  mockUserService,
  newUser,
  userResponse,
  validEmail,
} from '@/shared/test/constant';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { FindByEmail } from '../../application/use-case/find-by-email';
import { UserService } from '../../domain/services/user.service';

describe('Find By Id', () => {
  let findByEmail: FindByEmail;
  let userService: UserService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByEmail,
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

    findByEmail = module.get<FindByEmail>(FindByEmail);
    userService = module.get<UserService>(UserService);
    redisService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(findByEmail).toBeDefined();
    expect(userService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('Find By Email Use Case', () => {
    it('Should return user response success without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);

      const result = await findByEmail.execute(email);

      expect(result).toEqual(userResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should return user response success with redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);

      const result = await findByEmail.execute(email);

      expect(result).toEqual(userResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should throw an exception bad request User not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await findByEmail.execute(email);

      expect(result).toBeNull();
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
    });

    it('Should throw an exception Invalid email format', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(findByEmail.execute('test')).rejects.toThrow(
        new Error('Invalid email format'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with test: `);
    });
  });
});
