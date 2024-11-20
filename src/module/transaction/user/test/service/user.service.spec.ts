import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from '../../domain/repositories/user.repository';
import { UserService } from '../../domain/services/user.service';
import { Email } from '../../domain/value-object/email';
import { UserId } from '../../domain/value-object/userId';

import {
  authorities,
  id,
  invalidEmail,
  mockUserRepository,
  newEmail,
  newPassword,
  newProvider,
  newRole,
  newUser,
  newUsername,
  password,
  username,
  userProvider,
  validEmail,
} from '@/shared/test/constant';
import { Provider } from '../../domain/value-object/provider';
import { RoleEntity } from '../../domain/entities/role.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('Create User', () => {
    it('Should create user sucessfully', async () => {
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.createUser(username, validEmail, password);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('Should create user fail with invalid email format', async () => {
      mockUserRepository.save.mockResolvedValue(null);

      expect(
        async () =>
          await service.createUser(username, new Email(invalidEmail), password),
      ).rejects.toThrow(new Error('Invalid email format'));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Find User By Email', () => {
    it('Should return  user sucessfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(newUser);

      const result = await service.findByEmail(validEmail);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    });

    it('Should return user fail with invalid email format', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      expect(
        async () => await service.findByEmail(new Email(invalidEmail)),
      ).rejects.toThrow(new Error('Invalid email format'));
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('Find User By Id', () => {
    it('Should return  user sucessfully', async () => {
      mockUserRepository.findById.mockResolvedValue(newUser);

      const result = await service.findById(id);

      expect(result).toEqual(newUser);
      expect(mockUserRepository.findById).toHaveBeenCalled();
    });

    it('Should return user fail with invalid id format', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      expect(
        async () => await service.findById(new UserId('h9sad98')),
      ).rejects.toThrow(new Error('Invalid UUID format'));
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('Delete user', () => {
    it('Should success delete user', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await service.delete(newUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.delete).toHaveBeenCalledWith(newUser);
    });

    it('Should fail delete user', async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      const result = await service.delete(newUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.delete).toHaveBeenCalledWith(newUser);
    });
  });

  describe('Update user', () => {
    it('Should success update user', async () => {
      mockUserRepository.update.mockResolvedValue(true);

      const result = await service.update(newUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.update).toHaveBeenCalledWith(newUser);
    });

    it('Should fail update user', async () => {
      mockUserRepository.update.mockResolvedValue(false);

      const result = await service.update(newUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.update).toHaveBeenCalledWith(newUser);
    });
  });

  describe('Change Username', () => {
    it('Should success change username', async () => {
      const updateUser = newUser;
      updateUser.setUsername(newUsername);

      mockUserRepository.changeUsername.mockResolvedValue(true);

      const result = await service.changeUsername(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.changeUsername).toHaveBeenCalledWith(
        updateUser,
      );
    });

    it('Should fail change username', async () => {
      const updateUser = newUser;
      updateUser.setUsername(newUsername);

      mockUserRepository.changeUsername.mockResolvedValue(false);

      const result = await service.changeUsername(updateUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.changeUsername).toHaveBeenCalledWith(
        updateUser,
      );
    });
  });

  describe('Change Password', () => {
    it('Should success change Password', async () => {
      const updateUser = newUser;
      updateUser.setPassword(newPassword);

      mockUserRepository.changePassword.mockResolvedValue(true);

      const result = await service.changePassword(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.changePassword).toHaveBeenCalledWith(
        updateUser,
      );
    });

    it('Should fail change Password', async () => {
      const updateUser = newUser;
      updateUser.setPassword(newPassword);

      mockUserRepository.changePassword.mockResolvedValue(false);

      const result = await service.changePassword(updateUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.changePassword).toHaveBeenCalledWith(
        updateUser,
      );
    });
  });

  describe('Change Email', () => {
    it('Should success change Email', async () => {
      const email = new Email(newEmail);

      const updateUser = newUser;
      updateUser.setEmail(email);

      mockUserRepository.changeEmail.mockResolvedValue(true);

      const result = await service.changeEmail(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.changeEmail).toHaveBeenCalledWith(updateUser);
    });

    it('Should fail change Email', async () => {
      const email = new Email(newEmail);

      const updateUser = newUser;
      updateUser.setEmail(email);

      mockUserRepository.changeEmail.mockResolvedValue(false);

      const result = await service.changeEmail(newUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.changeEmail).toHaveBeenCalledWith(newUser);
    });
  });

  describe('Update Provider', () => {
    it('Should success update provider', async () => {
      const updateUser = newUser;
      updateUser.setProvider(new Provider(newProvider));

      mockUserRepository.updateProvider.mockResolvedValue(true);

      const result = await service.updateProvider(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.updateProvider).toHaveBeenCalledWith(
        updateUser,
      );
    });

    it('Should fail Update Provider', async () => {
      const updateUser = newUser;
      updateUser.setProvider(new Provider(newProvider));

      mockUserRepository.updateProvider.mockResolvedValue(false);

      const result = await service.updateProvider(updateUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.updateProvider).toHaveBeenCalledWith(
        updateUser,
      );
    });
  });

  describe('Update Authorities', () => {
    it('Should success update Authorities', async () => {
      const newAuthorities = authorities;
      newAuthorities.add(new RoleEntity(2, newRole));

      const updateUser = newUser;
      updateUser.setAuthorities(newAuthorities);

      mockUserRepository.updateAuthorities.mockResolvedValue(true);

      const result = await service.updateAuthorities(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.updateAuthorities).toHaveBeenCalledWith(
        updateUser,
      );
    });

    it('Should fail Update Authorities', async () => {
      const newAuthorities = authorities;
      newAuthorities.add(new RoleEntity(2, newRole));

      const updateUser = newUser;
      updateUser.setAuthorities(newAuthorities);

      mockUserRepository.updateAuthorities.mockResolvedValue(false);

      const result = await service.updateAuthorities(updateUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.updateAuthorities).toHaveBeenCalledWith(
        updateUser,
      );
    });
  });

  describe('Verify User', () => {
    it('Should success verify user', async () => {
      const updateUser = newUser;
      updateUser.setIsVerified(true);

      mockUserRepository.verifyUser.mockResolvedValue(true);

      const result = await service.verifyUser(updateUser);

      expect(result).toBeTruthy();
      expect(mockUserRepository.verifyUser).toHaveBeenCalledWith(updateUser);
    });

    it('Should fail verify user', async () => {
      const updateUser = newUser;
      updateUser.setIsVerified(true);

      mockUserRepository.verifyUser.mockResolvedValue(false);

      const result = await service.verifyUser(updateUser);

      expect(result).toBeFalsy();
      expect(mockUserRepository.verifyUser).toHaveBeenCalledWith(updateUser);
    });
  });

  describe('Create User OAuth', () => {
    it('Should create user sucessfully', async () => {
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.createUserOAuth(
        username,
        validEmail,
        password,
        userProvider,
        authorities,
      );

      expect(result).toEqual(newUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('Should create user fail with invalid email format', async () => {
      mockUserRepository.save.mockResolvedValue(null);

      expect(
        async () =>
          await service.createUserOAuth(
            username,
            new Email(invalidEmail),
            password,
            userProvider,
            authorities,
          ),
      ).rejects.toThrow(new Error('Invalid email format'));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
