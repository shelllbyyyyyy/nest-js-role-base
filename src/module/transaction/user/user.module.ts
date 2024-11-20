import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/common/startegies/jwt.startegy';
import { AdminStrategy } from '@/common/startegies/admin.startegy';
import { BcryptService } from '@/shared/libs/bcrypt';

import { UserServiceHandlers } from './application/handler';
import { UserServiceUseCases } from './application/use-case';
import { UserService } from './domain/services/user.service';
import { UserRepository } from './domain/repositories/user.repository';
import { UserRepositoryImpl } from './infrastructure/persistence/pg/user.repository.impl';
import { UserController } from './presentation/controller/user.controller';

const userRepository = {
  provide: UserRepository,
  useClass: UserRepositoryImpl,
};

@Module({
  controllers: [UserController],
  providers: [
    ...UserServiceHandlers,
    ...UserServiceUseCases,
    UserService,
    userRepository,
    JwtStrategy,
    AdminStrategy,
    BcryptService,
  ],
})
export class UserModule {}
