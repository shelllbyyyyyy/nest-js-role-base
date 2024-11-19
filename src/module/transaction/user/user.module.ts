import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/common/startegies/jwt.startegy';
import { AdminStrategy } from '@/common/startegies/admin.startegy';
import { BcryptService } from '@/shared/libs/bcrypt';

import { HandlerService } from './application/handler/handler-service';
import { UserActionFactory } from './application/factory/user-action-factory';
import { ChangePassword } from './application/handler/change-password';
import { ChangeUsername } from './application/handler/change-username';
import { ChangeEmail } from './application/handler/change-email';
import { UpdateAuthorities } from './application/handler/update-authorities';
import { UpdateProvider } from './application/handler/update-provider';
import { VerifyUser } from './application/handler/verify-user';
import { FindByEmail } from './application/use-case/find-by-email';
import { DeleteUser } from './application/use-case/delete-user';
import { FindById } from './application/use-case/find-by-id';
import { FindAll } from './application/use-case/find-all';
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
    HandlerService,
    UserActionFactory,
    UserService,
    userRepository,
    FindAll,
    FindByEmail,
    FindById,
    DeleteUser,
    JwtStrategy,
    AdminStrategy,
    ChangePassword,
    ChangeUsername,
    ChangeEmail,
    UpdateAuthorities,
    UpdateProvider,
    VerifyUser,
    BcryptService,
  ],
})
export class UserModule {}
