import { Module } from '@nestjs/common';

import { GoogleOauthStrategy } from '@/common/startegies/google.oauth.strategy';
import { GithubOAuthStrategy } from '@/common/startegies/github.oauth.strategy';
import { LocalStrategy } from '@/common/startegies/local.startegy';
import { BcryptService } from '@/shared/libs/bcrypt';
import { Tokenizer } from '@/shared/libs/tokenizer';

import { UserRepositoryImpl as Elastic } from '../transaction/user/infrastructure/persistence/elastic/user.repository.impl';
import { UserRepositoryImpl as PG } from '../transaction/user/infrastructure/persistence/pg/user.repository.impl';
import { UserService } from '../transaction/user/domain/services/user.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { FindByEmail } from '../transaction/user/application/use-case/find-by-email';
import { RegisterUser } from '../transaction/user/application/use-case/register-user';
import { OAuth } from '../transaction/user/application/use-case/oauth';

import { ValidateUserCredentials } from './application/use-case/validate-user-credentials';
import { GenerateJwtToken } from './application/use-case/generate-jwt-token';

const PGUserRepository = {
  provide: 'PGUserRepository',
  useClass: PG,
};

const ElasticUserRepository = {
  provide: 'ElasticUserRepository',
  useClass: Elastic,
};

@Module({
  controllers: [AuthController],
  providers: [
    UserService,
    PGUserRepository,
    ElasticUserRepository,
    FindByEmail,
    OAuth,
    RegisterUser,
    BcryptService,
    ValidateUserCredentials,
    GenerateJwtToken,
    LocalStrategy,
    GoogleOauthStrategy,
    GithubOAuthStrategy,
    Tokenizer,
  ],
  exports: ['PGUserRepository', 'ElasticUserRepository'],
})
export class AuthModule {}
