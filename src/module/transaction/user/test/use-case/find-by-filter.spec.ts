import { Test, TestingModule } from '@nestjs/testing';

import {
  deepCopy,
  mockUserService,
  newEmail,
  paginationUserEntity,
  paginationUserResponse,
  username,
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
    mockUserService.findByFilter.mockResolvedValue(paginationUserEntity);

    const result = await findByFilter.execute({ username: username });

    expect(result).toEqual(paginationUserResponse);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });

  it('Should return list of user success of zero', async () => {
    const copyEntity = deepCopy(paginationUserEntity);
    copyEntity['data'] = [];
    copyEntity['limit'] = 0;
    copyEntity['total'] = 0;
    copyEntity['page'] = 0;
    copyEntity['total_pages'] = 0;

    const copyResponse = deepCopy(paginationUserResponse);
    copyResponse['data'] = [];
    copyResponse['limit'] = 0;
    copyResponse['total'] = 0;
    copyResponse['page'] = 0;
    copyResponse['total_pages'] = 0;

    mockUserService.findByFilter.mockResolvedValue(copyEntity);

    const result = await findByFilter.execute({ email: newEmail });

    expect(result).toEqual(copyResponse);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });
});
