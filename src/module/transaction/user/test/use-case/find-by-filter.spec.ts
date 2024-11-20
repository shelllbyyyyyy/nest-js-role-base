import { Test, TestingModule } from '@nestjs/testing';

import {
  mockUserService,
  newEmail,
  newUser,
  username,
  userResponse,
} from '@/shared/test/constant';

import { UserService } from '../../domain/services/user.service';
import { FindByFilter } from '../../application/use-case/find-by-filter';

describe('Find All', () => {
  let findByFilter: FindByFilter;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByFilter,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    findByFilter = module.get<FindByFilter>(FindByFilter);
  });

  it('Should defined', () => {
    expect(userService).toBeDefined();
    expect(findByFilter).toBeDefined();
  });

  it('Should return list of user success', async () => {
    mockUserService.findByFilter.mockResolvedValue([newUser]);

    const result = await findByFilter.execute({ username: username });

    expect(result).toEqual([userResponse]);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });

  it('Should return list of user success of zero', async () => {
    mockUserService.findByFilter.mockResolvedValue([]);

    const result = await findByFilter.execute({ email: newEmail });

    expect(result).toEqual([]);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });
});
