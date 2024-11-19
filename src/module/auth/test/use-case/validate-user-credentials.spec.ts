import { BcryptService } from '@/shared/libs/bcrypt';
import { Test, TestingModule } from '@nestjs/testing';

import { ValidateUserCredentials } from '../../application/use-case/validate-user-credentials';
import {
  mockBcryptService,
  password,
  userResponse,
} from '@/shared/test/constant';

describe('Validate User Credentials', () => {
  let validateUserCredentials: ValidateUserCredentials;
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserCredentials,
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
      ],
    }).compile();

    validateUserCredentials = module.get<ValidateUserCredentials>(
      ValidateUserCredentials,
    );
    bcryptService = module.get<BcryptService>(BcryptService);

    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(validateUserCredentials).toBeDefined();
    expect(bcryptService).toBeDefined();
  });

  describe('Validate User Credemtials', () => {
    it('Should generate token success with valid credentials', async () => {
      mockBcryptService.comparePassword.mockResolvedValue(true);

      const result = await validateUserCredentials.execute({
        password: password,
        user: userResponse,
      });

      expect(result).toBeTruthy();
      expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
        password,
        userResponse.password,
      );
    });

    it('Should generate token fail with invalid credentials', async () => {
      mockBcryptService.comparePassword.mockResolvedValue(false);

      const result = await validateUserCredentials.execute({
        password: password,
        user: userResponse,
      });

      expect(result).toBeFalsy();
      expect(mockBcryptService.comparePassword).toHaveBeenCalledWith(
        password,
        userResponse.password,
      );
    });
  });
});
