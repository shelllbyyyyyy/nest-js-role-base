import { Test, TestingModule } from '@nestjs/testing';

import { RedisService } from '@/shared/libs/redis/redis.service';
import {
  email,
  mockRedisService,
  mockUserService,
  newUser,
  userResponse,
} from '@/shared/test/constant';

import { DeleteUser } from '../../application/use-case/delete-user';
import { UserService } from '../../domain/services/user.service';

describe('Delete User', () => {
  let deleteUser: DeleteUser;
  let redisService: RedisService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUser,
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

    deleteUser = module.get<DeleteUser>(DeleteUser);
    redisService = module.get<RedisService>(RedisService);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('Should Defined', () => {
    expect(deleteUser).toBeDefined();
    expect(redisService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('Delete User Use Case', () => {
    it('Should success delete user', async () => {
      mockRedisService.del.mockResolvedValue(1);
      mockUserService.delete.mockResolvedValue(true);

      const result = await deleteUser.execute(userResponse);

      expect(result).toBeTruthy();
      expect(mockRedisService.del).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.delete).toHaveBeenCalledWith(newUser);
    });

    it('Should fail delete user', async () => {
      mockRedisService.del.mockResolvedValue(0);
      mockUserService.delete.mockResolvedValue(false);

      const result = await deleteUser.execute(null);

      expect(result).toBeFalsy();
      expect(mockRedisService.del).not.toHaveBeenCalledWith(
        `user with ${email}: `,
      );
      expect(mockUserService.delete).not.toHaveBeenCalledWith(newUser);
    });
  });
});
