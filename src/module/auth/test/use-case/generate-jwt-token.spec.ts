import { Tokenizer } from '@/shared/libs/tokenizer';
import { Test, TestingModule } from '@nestjs/testing';

import { GenerateJwtToken } from '../../application/use-case/generate-jwt-token';
import {
  access_token,
  mockTokenizer,
  payload,
  refresh_token,
  userResponse,
} from '@/shared/test/constant';

describe('Generate Jwt Token', () => {
  let generateJwtToken: GenerateJwtToken;
  let tokenizer: Tokenizer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateJwtToken,
        {
          provide: Tokenizer,
          useValue: mockTokenizer,
        },
      ],
    }).compile();

    generateJwtToken = module.get<GenerateJwtToken>(GenerateJwtToken);
    tokenizer = module.get<Tokenizer>(Tokenizer);

    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(generateJwtToken).toBeDefined();
    expect(tokenizer).toBeDefined();
  });

  describe('Validate User Credemtials', () => {
    it('Should generate token success with valid credentials', async () => {
      mockTokenizer.generateToken.mockResolvedValueOnce(access_token);
      mockTokenizer.generateToken.mockResolvedValueOnce(refresh_token);

      const result = await generateJwtToken.execute(userResponse);

      expect(result).toEqual({
        access_token,
        refresh_token,
      });
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
    });

    it('Should generate token fail with invalid credentials', async () => {
      mockTokenizer.generateToken.mockRejectedValue(null);

      const result = await generateJwtToken.execute(null);

      expect(result).toBeNull();
    });
  });
});
