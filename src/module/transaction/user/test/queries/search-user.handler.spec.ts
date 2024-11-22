import { Test, TestingModule } from '@nestjs/testing';

import {
  deepCopy,
  email,
  mockUserService,
  paginationUserEntity,
  paginationUserResponse,
} from '@/shared/test/constant';

import { SearchUserHandler } from '../../application/queries/search-user.handler';
import { SearchUserQuery } from '../../application/queries/search-user.query';
import { UserService } from '../../domain/services/user.service';

describe('Search User Handler', () => {
  let searchUserHandler: SearchUserHandler;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchUserHandler,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    searchUserHandler = module.get<SearchUserHandler>(SearchUserHandler);
  });

  it('Should defined', () => {
    expect(userService).toBeDefined();
    expect(searchUserHandler).toBeDefined();
  });

  it('Should success filter user', async () => {
    mockUserService.findByFilter.mockResolvedValue(paginationUserEntity);

    const result = await searchUserHandler.execute(
      new SearchUserQuery(undefined, email),
    );

    expect(result).toEqual(paginationUserResponse);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });

  it('Should success filter user zero', async () => {
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

    const result = await searchUserHandler.execute(
      new SearchUserQuery(undefined, email),
    );

    expect(result).toEqual(copyResponse);
    expect(mockUserService.findByFilter).toHaveBeenCalled();
  });
});
