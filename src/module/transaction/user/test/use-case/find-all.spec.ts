import { Test, TestingModule } from '@nestjs/testing';

import { mockUserService, newUser, userResponse } from '@/shared/test/constant';

import { FindAll } from '../../application/use-case/find-all';
import { UserService } from '../../domain/services/user.service';

describe('Find All', () => {
  let findAll: FindAll;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindAll, { provide: UserService, useValue: mockUserService }],
    }).compile();

    userService = module.get<UserService>(UserService);
    findAll = module.get<FindAll>(FindAll);
  });

  it('Should defined', () => {
    expect(userService).toBeDefined();
    expect(findAll).toBeDefined();
  });

  it('Should return list of user success', async () => {
    mockUserService.findAll.mockResolvedValue([newUser]);

    const result = await findAll.execute();

    expect(result).toEqual([userResponse]);
    expect(mockUserService.findAll).toHaveBeenCalled();
  });

  it('Should return list of user success of zero', async () => {
    mockUserService.findAll.mockResolvedValue([]);

    const result = await findAll.execute();

    expect(result).toEqual([]);
    expect(mockUserService.findAll).toHaveBeenCalled();
  });
});
