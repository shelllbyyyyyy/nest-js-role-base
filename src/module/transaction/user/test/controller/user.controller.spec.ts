import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { RedisService } from '@/shared/libs/redis/redis.service';
import { BcryptService } from '@/shared/libs/bcrypt';
import {
  email,
  mockRedisService,
  mockUserRepository,
  mockUserService,
  newUser,
  userResponse,
  validEmail,
  findUserByEmailControllerResponse,
  invalidEmail,
  deleteUserControllerResponse,
  _id,
  id,
  mockBcryptService,
  newEmail,
  password,
  currentUser,
  updateUserControllerResponse,
  userPayload,
  deepCopy,
  newPassword,
  hashedPassword,
  newUsername,
  newProvider,
  role,
  newRole,
  findAllUserControllerResponse,
  findAllUserControllerResponsePagination,
  paginationUserResponse,
} from '@/shared/test/constant';

import { FindByFilter } from '../../application/use-case/find-by-filter';
import { SearchUserHandler } from '../../application/queries/search-user.handler';
import { SearchUserQuery } from '../../application/queries/search-user.query';
import { FindByEmail } from '../../application/use-case/find-by-email';
import { DeleteUser } from '../../application/use-case/delete-user';
import { FindById } from '../../application/use-case/find-by-id';
import { FindAll } from '../../application/use-case/find-all';
import { HandlerService } from '../../application/handler/handler-service';
import { UserActionFactory } from '../../application/factory/user-action-factory';
import { ChangePassword } from '../../application/handler/change-password';
import { ChangeUsername } from '../../application/handler/change-username';
import { ChangeEmail } from '../../application/handler/change-email';
import { UpdateAuthorities } from '../../application/handler/update-authorities';
import { UpdateProvider } from '../../application/handler/update-provider';
import { VerifyUser } from '../../application/handler/verify-user';
import { RoleEntity } from '../../domain/entities/role.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserService } from '../../domain/services/user.service';
import { Email } from '../../domain/value-object/email';
import { Provider } from '../../domain/value-object/provider';
import { UserController } from '../../presentation/controller/user.controller';

describe('UserController', () => {
  let controller: UserController;
  let eventEmitter: EventEmitter2;
  let findByEmail: FindByEmail;
  let findById: FindById;
  let deleteUser: DeleteUser;
  let userService: UserService;
  let redisService: RedisService;
  let findAll: FindAll;
  let findByFilter: FindByFilter;
  let handlerService: HandlerService;
  let userActionFactory: UserActionFactory;
  let changePassword: ChangePassword;
  let changeUsername: ChangeUsername;
  let changeEmail: ChangeEmail;
  let updateAuthorities: UpdateAuthorities;
  let updateProvider: UpdateProvider;
  let verifyUser: VerifyUser;
  let bcryptService: BcryptService;
  let searchUserHandler: SearchUserHandler;
  let queryBus: QueryBus;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        FindAll,
        FindByEmail,
        DeleteUser,
        FindById,
        EventEmitter2,
        HandlerService,
        UserActionFactory,
        ChangePassword,
        ChangeUsername,
        ChangeEmail,
        UpdateAuthorities,
        UpdateProvider,
        VerifyUser,
        FindByFilter,
        SearchUserHandler,
        QueryBus,
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
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

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    findByEmail = module.get<FindByEmail>(FindByEmail);
    findById = module.get<FindById>(FindById);
    deleteUser = module.get<DeleteUser>(DeleteUser);
    redisService = module.get<RedisService>(RedisService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    findAll = module.get<FindAll>(FindAll);
    findByFilter = module.get<FindByFilter>(FindByFilter);
    handlerService = module.get<HandlerService>(HandlerService);
    userActionFactory = module.get<UserActionFactory>(UserActionFactory);
    changePassword = module.get<ChangePassword>(ChangePassword);
    changeUsername = module.get<ChangeUsername>(ChangeUsername);
    changeEmail = module.get<ChangeEmail>(ChangeEmail);
    updateProvider = module.get<UpdateProvider>(UpdateProvider);
    updateAuthorities = module.get<UpdateAuthorities>(UpdateAuthorities);
    verifyUser = module.get<VerifyUser>(VerifyUser);
    bcryptService = module.get<BcryptService>(BcryptService);
    findByFilter = module.get<FindByFilter>(FindByFilter);
    searchUserHandler = module.get<SearchUserHandler>(SearchUserHandler);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userService).toBeDefined();
    expect(findByEmail).toBeDefined();
    expect(findById).toBeDefined();
    expect(deleteUser).toBeDefined();
    expect(redisService).toBeDefined();
    expect(eventEmitter).toBeDefined();
    expect(findAll).toBeDefined();
    expect(handlerService).toBeDefined();
    expect(userActionFactory).toBeDefined();
    expect(changeEmail).toBeDefined();
    expect(changePassword).toBeDefined();
    expect(changeUsername).toBeDefined();
    expect(updateAuthorities).toBeDefined();
    expect(updateProvider).toBeDefined();
    expect(verifyUser).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(findByFilter).toBeDefined();
    expect(searchUserHandler).toBeDefined();
    expect(queryBus).toBeDefined();
  });

  describe('Find all user', () => {
    it('Should return list of user', async () => {
      mockUserService.findAll.mockResolvedValue([newUser, newUser]);

      const result = await controller.findAllUser();

      expect(result).toEqual(findAllUserControllerResponse);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it('Should return list of user zero', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAllUser();

      const copy = findAllUserControllerResponse.clone();
      copy.data = [];

      expect(result).toEqual(copy);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('Find user by filter', () => {
    it('Should return list of user', async () => {
      const query = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue(paginationUserResponse);

      const result = await controller.findUserByFilter({
        email: email,
      });

      expect(result).toEqual(findAllUserControllerResponsePagination);
      expect(query).toHaveBeenCalledWith(new SearchUserQuery(undefined, email));
    });

    it('Should return list of user zero', async () => {
      const copyResponse = deepCopy(paginationUserResponse);
      copyResponse['data'] = [];
      copyResponse['limit'] = 0;
      copyResponse['total'] = 0;
      copyResponse['page'] = 0;
      copyResponse['total_pages'] = 0;

      const query = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue(copyResponse);

      const result = await controller.findUserByFilter({
        email: email,
      });

      const copy = findAllUserControllerResponsePagination.clone();
      copy.data = [];
      copy.limit = 0;
      copy.total = 0;
      copy.page = 0;
      copy.total_pages = 0;

      expect(result).toEqual(copy);
      expect(query).toHaveBeenCalledWith(new SearchUserQuery(undefined, email));
    });
  });

  describe('Find user by email use case', () => {
    it('Should return user response success without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');

      const result = await controller.findUserByEmail(email);

      expect(result).toEqual(findUserByEmailControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
    });

    it('Should return user response success with redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');

      const result = await controller.findUserByEmail(email);

      expect(result).toEqual(findUserByEmailControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
    });

    it('Should throw an exception bad request User not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');

      await expect(controller.findUserByEmail(email)).rejects.toThrow(
        new BadRequestException('User not found'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${email}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
    });

    it('Should throw an exception Invalid email format', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');

      await expect(controller.findUserByEmail(invalidEmail)).rejects.toThrow(
        new Error('Invalid email format'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${invalidEmail}: `,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(invalidEmail);
    });
  });

  describe('Find user by id use case', () => {
    it('Should return user response success without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findById.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);

      const mockFindById = jest.spyOn(findById, 'execute');

      const result = await controller.findUserById(_id);

      expect(result).toEqual(findUserByEmailControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).toHaveBeenCalledWith(id);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindById).toHaveBeenCalledWith(_id);
    });

    it('Should return user response success with redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);

      const mockFindById = jest.spyOn(findById, 'execute');

      const result = await controller.findUserById(_id);

      expect(result).toEqual(findUserByEmailControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).not.toHaveBeenCalledWith(id);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindById).toHaveBeenCalledWith(_id);
    });

    it('Should throw an exception bad request User not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findById.mockResolvedValue(null);

      const mockFindById = jest.spyOn(findById, 'execute');

      await expect(controller.findUserById(_id)).rejects.toThrow(
        new BadRequestException('User not found'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${_id}: `);
      expect(mockUserService.findById).toHaveBeenCalledWith(id);
      expect(mockRedisService.set).not.toHaveBeenCalledWith(
        `user with ${_id}: `,
        userResponse,
        7 * 24 * 60 * 60,
      );
      expect(mockFindById).toHaveBeenCalledWith(_id);
    });

    it('Should throw an exception Invalid id format', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockFindById = jest.spyOn(findById, 'execute');

      await expect(controller.findUserById('test')).rejects.toThrow(
        new Error('Invalid UUID format'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with test: `);
      expect(mockFindById).toHaveBeenCalledWith('test');
    });
  });

  describe('Delete user use case', () => {
    it('Should delete user success without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockRedisService.set.mockResolvedValue(userResponse);
      mockRedisService.del.mockResolvedValue(1);
      mockUserService.delete.mockResolvedValue(true);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');
      const mockDeleteUser = jest.spyOn(deleteUser, 'execute');

      const result = await controller.deleteUserByEmail(email);

      expect(result).toEqual(deleteUserControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockUserService.delete).toHaveBeenCalledWith(newUser);
      expect(mockRedisService.del).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(mockDeleteUser).toHaveBeenCalledWith(userResponse);
    });

    it('Should delete user success with redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);
      mockUserService.delete.mockResolvedValue(true);
      mockRedisService.del.mockResolvedValue(1);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');
      const mockDeleteUser = jest.spyOn(deleteUser, 'execute');

      const result = await controller.deleteUserByEmail(email);

      expect(result).toEqual(deleteUserControllerResponse);
      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockUserService.delete).toHaveBeenCalledWith(newUser);
      expect(mockRedisService.del).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(mockDeleteUser).toHaveBeenCalledWith(userResponse);
    });

    it('Should delete user fail without redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(newUser);
      mockUserService.delete.mockResolvedValue(false);
      mockRedisService.del.mockResolvedValue(0);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');
      const mockDeleteUser = jest.spyOn(deleteUser, 'execute');

      await expect(controller.deleteUserByEmail(email)).rejects.toThrow(
        new InternalServerErrorException(),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockUserService.delete).toHaveBeenCalledWith(newUser);
      expect(mockRedisService.del).not.toHaveBeenCalledWith(
        `user with ${email}: `,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(mockDeleteUser).toHaveBeenCalledWith(userResponse);
    });

    it('Should delete user fail witht redis', async () => {
      mockRedisService.get.mockResolvedValue(userResponse);
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.delete.mockResolvedValue(false);
      mockRedisService.del.mockResolvedValue(0);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');
      const mockDeleteUser = jest.spyOn(deleteUser, 'execute');

      await expect(controller.deleteUserByEmail(email)).rejects.toThrow(
        new InternalServerErrorException(),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(validEmail);
      expect(mockUserService.delete).toHaveBeenCalledWith(newUser);
      expect(mockRedisService.del).not.toHaveBeenCalledWith(
        `user with ${email}: `,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(mockDeleteUser).toHaveBeenCalledWith(userResponse);
    });

    it('Should throw an exception bad request User not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockUserService.findByEmail.mockResolvedValue(null);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');
      const mockDeleteUser = jest.spyOn(deleteUser, 'execute');

      await expect(controller.deleteUserByEmail(email)).rejects.toThrow(
        new BadRequestException('User not found'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(`user with ${email}: `);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
      expect(mockUserService.delete).not.toHaveBeenCalledWith(newUser);
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('Should throw an exception Invalid email format', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const mockFindByEmail = jest.spyOn(findByEmail, 'execute');

      await expect(controller.findUserByEmail(invalidEmail)).rejects.toThrow(
        new Error('Invalid email format'),
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user with ${invalidEmail}: `,
      );
      expect(mockFindByEmail).toHaveBeenCalledWith(invalidEmail);
    });
  });

  describe('Update user', () => {
    describe('Change email', () => {
      const updatedResponse = deepCopy(userResponse);
      updatedResponse.email = newEmail;

      const emails = new Email(newEmail);
      const updateUser = newUser.clone();
      updateUser.setEmail(emails);

      it('Should success change email with userResponse from database', async () => {
        mockRedisService.get.mockResolvedValue(null);
        mockUserService.findByEmail.mockResolvedValue(newUser);
        mockRedisService.set.mockResolvedValueOnce(userResponse);
        mockBcryptService.comparePassword.mockResolvedValue(true);
        mockUserService.changeEmail.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changeEmail',
          { current_password: password, email: newEmail },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockUserService.changeEmail).toHaveBeenCalledWith(updateUser);
        expect(mockRedisService.set).toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should success change email with userResponse from redis', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockBcryptService.comparePassword.mockResolvedValue(true);
        mockUserService.changeEmail.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changeEmail',
          { current_password: password, email: newEmail },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockUserService.changeEmail).toHaveBeenCalledWith(updateUser);
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
      });

      it('Should fail change email with undefined input', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockBcryptService.comparePassword.mockResolvedValue(false);
        mockUserService.changeEmail.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'changeEmail',
            { current_password: undefined, email: undefined },
            currentUser,
          ),
        ).rejects.toThrow(
          new BadRequestException('New email/old password cannot be undefined'),
        );

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockUserService.changeEmail).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should fail change email with password not match', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockBcryptService.comparePassword.mockResolvedValue(false);
        mockUserService.changeEmail.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'changeEmail',
            { current_password: '1234567890', email: newEmail },
            currentUser,
          ),
        ).rejects.toThrow(new UnauthorizedException('Password not match'));

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          '1234567890',
          userResponse.password,
        );
        expect(mockUserService.changeEmail).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });
    });

    describe('Change password', () => {
      const updatedResponse = deepCopy(userResponse);
      updatedResponse.password = hashedPassword;

      const updateUser = newUser.clone();
      updateUser.setPassword(hashedPassword);

      it('Should success change password with userResponse from database', async () => {
        mockRedisService.get.mockResolvedValue(null);
        mockUserService.findByEmail.mockResolvedValue(newUser);
        mockRedisService.set.mockResolvedValueOnce(userResponse);
        mockBcryptService.comparePassword.mockResolvedValue(true);
        mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
        mockUserService.changePassword.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changePassword',
          { current_password: password, password: newPassword },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(
          newPassword,
        );
        expect(mockUserService.changePassword).toHaveBeenCalledWith(updateUser);
        expect(mockRedisService.set).toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should success change password with userResponse from redis', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockBcryptService.comparePassword.mockResolvedValue(true);
        mockBcryptService.hashPassword.mockResolvedValue(hashedPassword);
        mockUserService.changePassword.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changePassword',
          { current_password: password, password: newPassword },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(
          newPassword,
        );
        expect(mockUserService.changePassword).toHaveBeenCalledWith(updateUser);
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
      });

      it('Should fail change password with undefined input', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockBcryptService.comparePassword.mockResolvedValue(false);
        mockUserService.changePassword.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'changePassword',
            { current_password: undefined, email: undefined },
            currentUser,
          ),
        ).rejects.toThrow(
          new BadRequestException(
            'New password/old password cannot be undefined',
          ),
        );

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockBcryptService.comparePassword).not.toHaveBeenCalledWith(
          userPayload.current_password,
          userResponse.password,
        );
        expect(mockUserService.changePassword).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should fail change password with password not match', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockBcryptService.comparePassword.mockResolvedValue(false);
        mockUserService.changePassword.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'changePassword',
            { current_password: '1234567890', password: newPassword },
            currentUser,
          ),
        ).rejects.toThrow(new UnauthorizedException('Password not match'));

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
          '1234567890',
          userResponse.password,
        );
        expect(mockUserService.changePassword).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });
    });

    describe('Change username', () => {
      const updatedResponse = deepCopy(userResponse);
      updatedResponse.username = newUsername;

      const updateUser = newUser.clone();
      updateUser.setUsername(newUsername);

      it('Should success change username with userResponse from database', async () => {
        mockRedisService.get.mockResolvedValue(null);
        mockUserService.findByEmail.mockResolvedValue(newUser);
        mockRedisService.set.mockResolvedValueOnce(userResponse);
        mockUserService.changeUsername.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changeUsername',
          { username: newUsername },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
        expect(mockUserService.changeUsername).toHaveBeenCalledWith(updateUser);
        expect(mockRedisService.set).toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should success change username with userResponse from redis', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockUserService.changeUsername.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'changeUsername',
          { username: newUsername },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.changeUsername).toHaveBeenCalledWith(updateUser);
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
      });

      it('Should fail change username with undefined input', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockUserService.changeUsername.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'changeUsername',
            { username: undefined },
            currentUser,
          ),
        ).rejects.toThrow(
          new BadRequestException('New username cannot be undefined'),
        );

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockUserService.changeUsername).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });
    });

    describe('Update provider', () => {
      const updatedResponse = deepCopy(userResponse);
      updatedResponse.provider = newProvider;

      const updateUser = newUser.clone();
      updateUser.setProvider(new Provider(newProvider));

      it('Should success update provider with userResponse from database', async () => {
        mockRedisService.get.mockResolvedValue(null);
        mockUserService.findByEmail.mockResolvedValue(newUser);
        mockRedisService.set.mockResolvedValueOnce(userResponse);
        mockUserService.updateProvider.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'updateProvider',
          { provider: newProvider },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
        expect(mockUserService.updateProvider).toHaveBeenCalledWith(updateUser);
        expect(mockRedisService.set).toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should success update provider with userResponse from redis', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockUserService.updateProvider.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'updateProvider',
          { provider: newProvider },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.updateProvider).toHaveBeenCalledWith(updateUser);
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
      });

      it('Should fail update provider with undefined input', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockUserService.updateProvider.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'updateProvider',
            { provider: undefined },
            currentUser,
          ),
        ).rejects.toThrow(
          new BadRequestException('New provider cannot be undefined'),
        );

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockUserService.updateProvider).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });
    });

    describe('Update authorities', () => {
      const updatedResponse = deepCopy(userResponse);
      updatedResponse.authorities.push({ role_id: 2, authority: newRole });

      const authorities = new Set<RoleEntity>();
      authorities.add(role);
      authorities.add(new RoleEntity(2, newRole));

      const updateUser = newUser.clone();
      updateUser.setAuthorities(authorities);

      it('Should success update authorities with userResponse from database', async () => {
        mockRedisService.get.mockResolvedValue(null);
        mockUserService.findByEmail.mockResolvedValue(newUser);
        mockUserService.updateAuthorities.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'updateAuthorities',
          { role: newRole },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(validEmail);
        expect(mockUserService.updateAuthorities).toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).toHaveBeenCalledTimes(3);
        // TO DO FIX THIS ERROR FUCKING SHIT
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });

      it('Should success update authorities with userResponse from redis', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockUserService.updateAuthorities.mockResolvedValue(true);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);
        mockRedisService.set.mockResolvedValueOnce(updatedResponse);

        const result = await controller.updateUser(
          'updateAuthorities',
          { role: newRole },
          currentUser,
        );

        expect(result).toEqual(updateUserControllerResponse);
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.updateAuthorities).toHaveBeenCalledWith(
          updateUser,
        );
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
      });

      it('Should fail update authorities with undefined input', async () => {
        mockRedisService.get.mockResolvedValue(userResponse);
        mockUserService.findByEmail.mockResolvedValue(null);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockUserService.updateAuthorities.mockResolvedValue(false);
        mockRedisService.set.mockResolvedValueOnce(null);
        mockRedisService.set.mockResolvedValueOnce(null);

        await expect(
          controller.updateUser(
            'updateAuthorities',
            { role: undefined },
            currentUser,
          ),
        ).rejects.toThrow(
          new BadRequestException('New authorities cannot be undefined'),
        );

        expect(mockRedisService.get).toHaveBeenCalledWith(
          `user with ${userResponse.email}: `,
        );
        expect(mockUserService.findByEmail).not.toHaveBeenCalledWith(
          validEmail,
        );
        expect(mockUserService.updateAuthorities).not.toHaveBeenCalledWith(
          updateUser,
        );
        expect(mockRedisService.set).not.toHaveBeenCalledTimes(3);
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          1,
          `user with ${userResponse.email}: `,
          userResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          2,
          `user with ${updatedResponse.email}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
        expect(mockRedisService.set).not.toHaveBeenNthCalledWith(
          3,
          `user with ${updatedResponse.id}: `,
          updatedResponse,
          7 * 24 * 60 * 60,
        );
      });
    });
  });
});
