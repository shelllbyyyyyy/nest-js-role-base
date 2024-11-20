import { Test, TestingModule } from '@nestjs/testing';

import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';

import { UserService } from '../../domain/services/user.service';
import { RegisterUser } from '../../application/use-case/register-user';
import {
  email,
  hashedPassword,
  invalidEmail,
  mockBcryptService,
  mockRedisService,
  mockUserService,
  newUser,
  password,
  username,
  userResponse,
  validEmail,
} from '@/shared/test/constant';

describe('Register User use case', () => {
  let userService: UserService;
  let registerUser: RegisterUser;
  let bcryptService: BcryptService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUser,
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
    registerUser = module.get<RegisterUser>(RegisterUser);
    redisService = module.get<RedisService>(RedisService);
    bcryptService = module.get<BcryptService>(BcryptService);

    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(userService).toBeDefined();
    expect(registerUser).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('Register user', () => {
    it('Should success create user with valid data', async () => {
      mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
      mockRedisService.set.mockResolvedValueOnce(userResponse);
      mockRedisService.set.mockResolvedValueOnce(userResponse);
      mockUserService.createUser.mockResolvedValue(newUser);

      const result = await registerUser.execute({
        username: username,
        email: email,
        password: password,
      });

      expect(result).toEqual(userResponse);
      expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        1,
        `user with ${newUser.getEmail.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        2,
        `user with ${newUser.getId.getValue}: `,
        result,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });

    it('Should fail create user with invalid data', async () => {
      mockBcryptService.hashPassword.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValue(null);

      expect(async () => {
        await registerUser.execute({
          username: username,
          email: invalidEmail,
          password: password,
        });
      }).rejects.toThrow('Invalid email format');
      expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(password);
      expect(mockRedisService.set).not.toHaveBeenCalled();
      expect(mockUserService.createUser).not.toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });
  });
});
