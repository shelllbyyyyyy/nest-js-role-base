import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { FindByEmail } from '@/module/transaction/user/application/use-case/find-by-email';
import { Tokenizer } from '@/shared/libs/tokenizer';
import { GenerateJwtToken } from '../../application/use-case/generate-jwt-token';
import { BcryptService } from '@/shared/libs/bcrypt';
import { RedisService } from '@/shared/libs/redis/redis.service';
import { UserService } from '@/module/transaction/user/domain/services/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserCredentials } from '../../application/use-case/validate-user-credentials';
import {
  access_token,
  email,
  hashedPassword,
  loginUserControllerResponse,
  mockBcryptService,
  mockRedisService,
  mockTokenizer,
  mockUserService,
  newEmail,
  newPassword,
  newUser,
  password,
  payload,
  refresh_token,
  registerUserControllerResponse,
  username,
  userResponse,
  validEmail,
} from '@/shared/test/constant';
import { RegisterUser } from '@/module/transaction/user/application/use-case/register-user';
import {
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, response } from 'express';
import { Email } from '@/module/transaction/user/domain/value-object/email';

describe('AuthController', () => {
  let registerUser: RegisterUser;
  let controller: AuthController;
  let eventEmitter: EventEmitter2;
  let findByEmail: FindByEmail;
  let userService: UserService;
  let redisService: RedisService;
  let bcryptService: BcryptService;
  let tokenizer: Tokenizer;
  let generateJwtToken: GenerateJwtToken;
  let validateUserCredentials: ValidateUserCredentials;
  let res: Response;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn(),
    json: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        FindByEmail,
        GenerateJwtToken,
        ValidateUserCredentials,
        EventEmitter2,
        RegisterUser,
        {
          provide: Tokenizer,
          useValue: mockTokenizer,
        },
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
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

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    generateJwtToken = module.get<GenerateJwtToken>(GenerateJwtToken);
    validateUserCredentials = module.get<ValidateUserCredentials>(
      ValidateUserCredentials,
    );
    redisService = module.get<RedisService>(RedisService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    tokenizer = module.get<Tokenizer>(Tokenizer);
    bcryptService = module.get<BcryptService>(BcryptService);
    registerUser = module.get<RegisterUser>(RegisterUser);
    res = mockResponse as unknown as Response;

    jest.clearAllMocks();
  });

  it('Should defined', () => {
    expect(controller).toBeDefined();
    expect(redisService).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(tokenizer).toBeDefined();
    expect(validateUserCredentials).toBeDefined();
    expect(eventEmitter).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(generateJwtToken).toBeDefined();
    expect(userService).toBeDefined();
    expect(registerUser).toBeDefined();
  });

  describe('Register user', () => {
    it('Should success register user with valid data', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
      mockRedisService.set.mockResolvedValueOnce(userResponse);
      mockRedisService.set.mockResolvedValueOnce(userResponse);
      mockUserService.createUser.mockResolvedValue(newUser);

      const result = await controller.register({
        username: username,
        email: email,
        password: password,
      });

      expect(result).toEqual(registerUserControllerResponse);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        1,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        2,
        `user with ${newUser.getId.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });

    it('Should error register user using valid data with response from database', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValueOnce(userResponse);
      mockBcryptService.hashPassword.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValue(null);

      await expect(
        controller.register({
          username: username,
          email: email,
          password: password,
        }),
      ).rejects.toThrow(new BadRequestException('User already exist'));

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(password);
      expect(mockRedisService.set).toHaveBeenCalledTimes(1);
      expect(mockRedisService.set).toHaveBeenNthCalledWith(
        1,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        2,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        3,
        `user with ${newUser.getId.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUser).not.toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });

    it('Should error register user using valid data with response from redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockBcryptService.hashPassword.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValue(null);

      await expect(
        controller.register({
          username: username,
          email: email,
          password: password,
        }),
      ).rejects.toThrow(new BadRequestException('User already exist'));

      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(password);
      expect(mockRedisService.set).not.toHaveBeenCalledTimes(1);
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        1,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        2,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        3,
        `user with ${newUser.getId.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUser).not.toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });

    it('Should error register user using invalid data', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockBcryptService.hashPassword.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValue(null);

      await expect(
        controller.register({
          username: username,
          email: 'email1',
          password: password,
        }),
      ).rejects.toThrow(new BadRequestException('Invalid email format'));

      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with email1: `);
      expect(mockBcryptService.hashPassword).not.toHaveBeenCalledWith(password);
      expect(mockRedisService.set).not.toHaveBeenCalledTimes(1);
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        1,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        2,
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
        3,
        `user with ${newUser.getId.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockUserService.createUser).not.toHaveBeenCalledWith(
        username,
        validEmail,
        hashedPassword,
      );
    });
  });

  describe('Login', () => {
    it('Should success login with valid data response from database', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);
      mockBcryptService.comparePassword.mockResolvedValue(true);
      mockTokenizer.generateToken.mockResolvedValueOnce(access_token);
      mockTokenizer.generateToken.mockResolvedValueOnce(refresh_token);
      mockResponse.cookie.mockResolvedValueOnce(access_token);
      mockResponse.cookie.mockResolvedValueOnce(refresh_token);

      const result = await controller.login({ email, password }, res);

      expect(result).toEqual(
        mockResponse.status(HttpStatus.OK).json(loginUserControllerResponse),
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockTokenizer.generateToken).toHaveBeenCalledTimes(2);
      expect(mockTokenizer.generateToken).toHaveBeenNthCalledWith(
        1,
        payload,
        '1h',
      );
      expect(mockTokenizer.generateToken).toHaveBeenNthCalledWith(
        2,
        payload,
        '7d',
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });

    it('Should success login with valid data response from redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(null);
      mockBcryptService.comparePassword.mockResolvedValue(true);
      mockTokenizer.generateToken.mockResolvedValueOnce(access_token);
      mockTokenizer.generateToken.mockResolvedValueOnce(refresh_token);
      mockResponse.cookie.mockResolvedValueOnce(access_token);
      mockResponse.cookie.mockResolvedValueOnce(refresh_token);

      const result = await controller.login({ email, password }, res);

      expect(result).toEqual(
        mockResponse.status(HttpStatus.OK).json(loginUserControllerResponse),
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockTokenizer.generateToken).toHaveBeenCalledTimes(2);
      expect(mockTokenizer.generateToken).toHaveBeenNthCalledWith(
        1,
        payload,
        '1h',
      );
      expect(mockTokenizer.generateToken).toHaveBeenNthCalledWith(
        2,
        payload,
        '7d',
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });

    it('Should fail user not found login with valid email', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(null);
      mockBcryptService.comparePassword.mockResolvedValue(false);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);

      await expect(
        controller.login({ email: newEmail, password }, res),
      ).rejects.toThrow(new BadRequestException('User not found'));

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newEmail}: `,
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        new Email(newEmail),
      );
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenCalledTimes(2);
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        1,
        payload,
        '1h',
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        2,
        payload,
        '7d',
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });

    it('Should fail password not match login with valid password', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(null);
      mockBcryptService.comparePassword.mockResolvedValue(false);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);

      await expect(
        controller.login({ email, password: newPassword }, res),
      ).rejects.toThrow(new UnauthorizedException('Password not match'));

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
      );
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
        newPassword,
        hashedPassword,
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenCalledTimes(2);
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        1,
        payload,
        '1h',
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        2,
        payload,
        '7d',
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });

    it('Should fail login with invalid email', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(null);
      mockBcryptService.comparePassword.mockResolvedValue(false);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockTokenizer.generateToken.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);
      mockResponse.cookie.mockResolvedValueOnce(null);

      expect(
        async () => await controller.login({ email: '123df', password }, res),
      ).rejects.toThrow(new Error('Invalid email format'));

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with 123df: `);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${newUser.getEmail.getValue}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
        newPassword,
        hashedPassword,
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenCalledTimes(2);
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        1,
        payload,
        '1h',
      );
      expect(mockTokenizer.generateToken).not.toHaveBeenNthCalledWith(
        2,
        payload,
        '7d',
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'access_token',
        access_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 60,
          path: '/',
        },
      );
      expect(mockResponse.cookie).not.toHaveBeenCalledWith(
        'refresh_token',
        refresh_token,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        },
      );
    });
  });
});
