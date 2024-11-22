import { Module } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { JwtStrategy } from '@/common/startegies/jwt.startegy';
import { AdminStrategy } from '@/common/startegies/admin.startegy';
import { BcryptService } from '@/shared/libs/bcrypt';

import { UserServiceHandlers } from './application/handler';
import { UserServiceUseCases } from './application/use-case';
import { SearchUserHandler } from './application/queries/search-user.handler';
import { UserService } from './domain/services/user.service';
import { UserRepositoryImpl as PG } from './infrastructure/persistence/pg/user.repository.impl';
import { UserRepositoryImpl as ELASTIC } from './infrastructure/persistence/elastic/user.repository.impl';
import { UserController } from './presentation/controller/user.controller';

const PGUserRepository = {
  provide: 'PGUserRepository',
  useClass: PG,
};

const ElasticUserRepository = {
  provide: 'ElasticUserRepository',
  useClass: ELASTIC,
};

@Module({
  controllers: [UserController],
  providers: [
    ...UserServiceHandlers,
    ...UserServiceUseCases,
    UserService,
    PGUserRepository,
    ElasticUserRepository,
    JwtStrategy,
    AdminStrategy,
    BcryptService,
    SearchUserHandler,
    QueryBus,
  ],
  exports: ['PGUserRepository', 'ElasticUserRepository'],
})
export class UserModule {}
