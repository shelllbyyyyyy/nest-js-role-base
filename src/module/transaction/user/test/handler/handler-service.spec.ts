import { Test, TestingModule } from '@nestjs/testing';

import {
  newEmail,
  newPassword,
  newProvider,
  newRole,
  newUsername,
  password,
  userResponse,
} from '@/shared/test/constant';

import { UserActionFactory } from '../../application/factory/user-action-factory';
import { HandlerService } from '../../application/handler/handler-service';
import { ChangePassword } from '../../application/handler/change-password';
import { ChangeUsername } from '../../application/handler/change-username';
import { ChangeEmail } from '../../application/handler/change-email';
import { UpdateAuthorities } from '../../application/handler/update-authorities';
import { UpdateProvider } from '../../application/handler/update-provider';
import { VerifyUser } from '../../application/handler/verify-user';

describe('Handler Service', () => {
  let handlerService: HandlerService;
  let userActionFactory: UserActionFactory;
  let changePassword: ChangePassword;
  let changeUsername: ChangeUsername;
  let changeEmail: ChangeEmail;
  let updateAuthorities: UpdateAuthorities;
  let updateProvider: UpdateProvider;
  let verifyUser: VerifyUser;

  const mockChangePassword = {
    handle: jest.fn(),
  };

  const mockChangeUsername = {
    handle: jest.fn(),
  };

  const mockChangeEmail = {
    handle: jest.fn(),
  };

  const mockUpdateProvider = {
    handle: jest.fn(),
  };

  const mockUpdateAuthorities = {
    handle: jest.fn(),
  };

  const mockVerifyUser = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerService,
        UserActionFactory,
        {
          provide: ChangePassword,
          useValue: mockChangePassword,
        },
        {
          provide: ChangeUsername,
          useValue: mockChangeUsername,
        },
        {
          provide: ChangeEmail,
          useValue: mockChangeEmail,
        },
        {
          provide: UpdateProvider,
          useValue: mockUpdateProvider,
        },
        {
          provide: UpdateAuthorities,
          useValue: mockUpdateAuthorities,
        },
        {
          provide: VerifyUser,
          useValue: mockVerifyUser,
        },
      ],
    }).compile();

    handlerService = module.get<HandlerService>(HandlerService);
    userActionFactory = module.get<UserActionFactory>(UserActionFactory);
    changeEmail = module.get<ChangeEmail>(ChangeEmail);
    changePassword = module.get<ChangePassword>(ChangePassword);
    changeUsername = module.get<ChangeUsername>(ChangeUsername);
    updateProvider = module.get<UpdateProvider>(UpdateProvider);
    updateAuthorities = module.get<UpdateAuthorities>(UpdateAuthorities);
    verifyUser = module.get<VerifyUser>(VerifyUser);

    jest.clearAllMocks();
  });

  it('Should defiend', () => {
    expect(handlerService).toBeDefined();
    expect(userActionFactory).toBeDefined();
    expect(changeEmail).toBeDefined();
    expect(changePassword).toBeDefined();
    expect(changeUsername).toBeDefined();
    expect(updateAuthorities).toBeDefined();
    expect(updateProvider).toBeDefined();
    expect(verifyUser).toBeDefined();
  });

  it('Should error if no action matches', async () => {
    const action = 'test';

    await expect(
      handlerService.handleUserAction(action, userResponse, {
        email: newEmail,
        current_password: password,
      }),
    ).rejects.toThrow(new Error(`No handler found for action: ${action}`));
  });

  describe('Change Email', () => {
    it('Should success change email', async () => {
      mockChangeEmail.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changeEmail',
        userResponse,
        { email: newEmail, current_password: password },
      );

      expect(result).toBeTruthy();
      expect(mockChangeEmail.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changeEmail', userResponse, {
        email: newEmail,
        current_password: password,
      });
    });

    it('Should fail change email', async () => {
      mockChangeEmail.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changeEmail',
        userResponse,
        { email: newEmail, current_password: password },
      );

      expect(result).toBeFalsy();
      expect(mockChangeEmail.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changeEmail', userResponse, {
        email: newEmail,
        current_password: password,
      });
    });
  });

  describe('Change Password', () => {
    it('Should success change Password', async () => {
      mockChangePassword.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changePassword',
        userResponse,
        { password: newPassword, current_password: password },
      );

      expect(result).toBeTruthy();
      expect(mockChangePassword.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changePassword', userResponse, {
        password: newPassword,
        current_password: password,
      });
    });

    it('Should fail change Password', async () => {
      mockChangePassword.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changePassword',
        userResponse,
        { password: newPassword, current_password: password },
      );

      expect(result).toBeFalsy();
      expect(mockChangePassword.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changePassword', userResponse, {
        password: newPassword,
        current_password: password,
      });
    });
  });

  describe('Change Username', () => {
    it('Should success change Username', async () => {
      mockChangeUsername.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changeUsername',
        userResponse,
        { username: newUsername },
      );

      expect(result).toBeTruthy();
      expect(mockChangeUsername.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changeUsername', userResponse, {
        username: newUsername,
      });
    });

    it('Should fail change Username', async () => {
      mockChangeUsername.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'changeUsername',
        userResponse,
        { username: newUsername },
      );

      expect(result).toBeFalsy();
      expect(mockChangeUsername.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('changeUsername', userResponse, {
        username: newUsername,
      });
    });
  });

  describe('Udate Provider', () => {
    it('Should success update Provider', async () => {
      mockUpdateProvider.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'updateProvider',
        userResponse,
        { provider: newProvider },
      );

      expect(result).toBeTruthy();
      expect(mockUpdateProvider.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('updateProvider', userResponse, {
        provider: newProvider,
      });
    });

    it('Should fail update Provider', async () => {
      mockUpdateProvider.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'updateProvider',
        userResponse,
        { provider: newProvider },
      );

      expect(result).toBeFalsy();
      expect(mockUpdateProvider.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('updateProvider', userResponse, {
        provider: newProvider,
      });
    });
  });

  describe('Update Authorities', () => {
    it('Should success update Authorities', async () => {
      mockUpdateAuthorities.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'updateAuthorities',
        userResponse,
        { role: newRole },
      );

      expect(result).toBeTruthy();
      expect(mockUpdateAuthorities.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('updateAuthorities', userResponse, {
        role: newRole,
      });
    });

    it('Should fail update Authorities', async () => {
      mockUpdateAuthorities.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'updateAuthorities',
        userResponse,
        { role: newRole },
      );

      expect(result).toBeFalsy();
      expect(mockUpdateAuthorities.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('updateAuthorities', userResponse, {
        role: newRole,
      });
    });
  });

  describe('Verify User', () => {
    it('Should success verify User', async () => {
      mockVerifyUser.handle.mockResolvedValue(true);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'verifyUser',
        userResponse,
        { is_verified: true },
      );

      expect(result).toBeTruthy();
      expect(mockVerifyUser.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('verifyUser', userResponse, {
        is_verified: true,
      });
    });

    it('Should fail verify User', async () => {
      mockVerifyUser.handle.mockResolvedValue(false);
      const spy = jest.spyOn(handlerService, 'handleUserAction');

      const result = await handlerService.handleUserAction(
        'verifyUser',
        userResponse,
        { is_verified: false },
      );

      expect(result).toBeFalsy();
      expect(mockVerifyUser.handle).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('verifyUser', userResponse, {
        is_verified: false,
      });
    });
  });
});
