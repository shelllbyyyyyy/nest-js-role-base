import { Module } from '@nestjs/common';

import { LocalStrategy } from '@/common/startegies/local.startegy';
import { BcryptService } from '@/shared/libs/bcrypt';
import { Tokenizer } from '@/shared/libs/tokenizer';

import { UserRepository } from '../transaction/user/domain/repositories/user.repository';
import { UserRepositoryImpl } from '../transaction/user/infrastructure/persistence/pg/user.repository.impl';
import { UserService } from '../transaction/user/domain/services/user.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { FindByEmail } from '../transaction/user/application/use-case/find-by-email';
import { RegisterUser } from '../transaction/user/application/use-case/register-user';

import { ValidateUserCredentials } from './application/use-case/validate-user-credentials';
import { GenerateJwtToken } from './application/use-case/generate-jwt-token';

const userRepository = {
  provide: UserRepository,
  useClass: UserRepositoryImpl,
};

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    userRepository,
    FindByEmail,
    RegisterUser,
    BcryptService,
    ValidateUserCredentials,
    GenerateJwtToken,
    LocalStrategy,
    Tokenizer,
  ],
})
export class AuthModule {}
