import { ConfigModule as Config, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { readFileSync } from 'fs';
import {
  JwtModule as Jwt,
  JwtSecretRequestType,
  JwtSignOptions,
  JwtVerifyOptions,
} from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

const privateKey = readFileSync('./keys/private.pem', 'utf8');
export const publicKey = readFileSync('./keys/public.pem', 'utf8');

export const ConfigModule = Config.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
    ACCESS_TOKEN_SECRET: Joi.string().required(),
    REFRESH_TOKEN_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().required(),
    DB_REDIS_HOST: Joi.string().required(),
    DB_REDIS_PORT: Joi.string().required(),
    MAIL_HOST: Joi.string().required(),
    SMTP_USERNAME: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),
    CLIENT_URL: Joi.string().required(),
    BASE_URL: Joi.string().required(),
    SALT_BCRYPT: Joi.number().required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GITHUB_CLIENT_ID: Joi.string().required(),
    GITHUB_CLIENT_SECRET: Joi.string().required(),
    ELASTIC_NODE: Joi.string().required(),
  }),
  envFilePath: '.env',
});

export const JwtModule = Jwt.registerAsync({
  global: true,
  useFactory: async (configService: ConfigService) => ({
    signOptions: {
      algorithm: 'RS512',
      expiresIn: 60 * 60,
    },
    secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
    privateKey,
    publicKey,
    secretOrKeyProvider: (
      requestType: JwtSecretRequestType,
      tokenOrPayload: string | Object | Buffer,
      verifyOrSignOrOptions?: JwtVerifyOptions | JwtSignOptions,
    ) => {
      switch (requestType) {
        case JwtSecretRequestType.SIGN:
          return privateKey;
        case JwtSecretRequestType.VERIFY:
          return publicKey;
        default:
          return configService.get<string>('ACCESS_TOKEN_SECRET');
      }
    },
  }),
  inject: [ConfigService],
});

export const ThrottleModule = ThrottlerModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    throttlers: [{ ttl: 1, limit: 2 }],
  }),
  inject: [ConfigService],
});
