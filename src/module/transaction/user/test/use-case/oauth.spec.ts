import { Test, TestingModule } from '@nestjs/testing';

import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { OAuth } from '../../application/use-case/oauth';
import {
  authorities,
  copyUser,
  copyUserResponse,
  email,
  hashedPassword,
  invalidEmail,
  mockBcryptService,
  mockRedisService,
  mockUserService,
  newProvider,
  password,
  username,
  userProvider,
  validEmail,
} from '@/shared/test/constant';

describe('OAuth User use case', () => {
  let userService: UserService;
  let oAuth: OAuth;
  let bcryptService: BcryptService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuth,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    oAuth = module.get<OAuth>(OAuth);
    redisService = module.get<RedisService>(RedisService);
    bcryptService = module.get<BcryptService>(BcryptService);

    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
    expect(OAuth).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('OAuth user', () => {
    it('Should success create user oauth with valid data', async () => {
      mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
      mockRedisService.set.mockResolvedValueOnce(copyUserResponse);
      mockRedisService.set.mockResolvedValueOnce(copyUserResponse);
      mockUserService.createUserOAuth.mockResolvedValue(copyUser);

      const result = await oAuth.execute({
        username: username,
        email: email,
        password: password,
        provider: newProvider,
      });

      expect(result).toEqual(copyUserResponse);
      expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        1,
        `user with ${copyUser.getEmail.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        2,
        `user with ${copyUser.getId.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUserOAuth).toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
        userProvider,
        authorities,
      );
    });

    it('Should fail create user oauth with invalid data', async () => {
      mockBcryptService.hashPassword.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValue(null);

      expect(async () => {
        await oAuth.execute({
          username: username,
          email: invalidEmail,
          password: password,
          provider: newProvider,
        });
      }).rejects.toThrow('Invalid email format');
      expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(password);
      expect(mockRedisService.set).not.toHaveBeenCalled();
      expect(mockUserService.createUserOAuth).not.toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
        userProvider,
        authorities,
      );
    });
  });
});
