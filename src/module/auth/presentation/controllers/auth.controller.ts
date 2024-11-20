import { Request, Response } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ApiResponse } from '@/common/response/api';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { DynamicOAuthGuard } from '@/common/guards/dynamic-oauth.guard';

import { FindByEmail } from '@/module/transaction/user/application/use-case/find-by-email';
import { RegisterUser } from '@/module/transaction/user/application/use-case/register-user';
import { UserResponse } from '@/module/transaction/user/application/response/user.reposne';
import { OAuth } from '@/module/transaction/user/application/use-case/oauth';

import { RegisterDTO } from '../dto/register.dto';
import { LoginDTO } from '../dto/login.dto';
import { ValidateUserCredentials } from '../../application/use-case/validate-user-credentials';
import { GenerateJwtToken } from '../../application/use-case/generate-jwt-token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly registerUser: RegisterUser,
    private readonly oAuthHandler: OAuth,
    private readonly findByEmail: FindByEmail,
    private readonly validateUserCredentials: ValidateUserCredentials,
    private readonly generateJwtToken: GenerateJwtToken,
  ) {}

  @Post('register')
  async register(@Body() data: RegisterDTO) {
    try {
      const user = await this.findByEmail.execute(data.email);
      if (user) throw new BadRequestException('User already exist');

      const result = await this.registerUser.execute(data);

      if (result) {
        this.eventEmitter.emit('user.created', result);
      }

      return new ApiResponse(
        HttpStatus.CREATED,
        'Register Successfully',
        result,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: LoginDTO, @Res() res: Response) {
    const { email, password } = data;
    try {
      const user = await this.findByEmail.execute(email);
      if (!user) throw new BadRequestException('User not found');

      const validate = await this.validateUserCredentials.execute({
        password,
        user,
      });
      if (!validate) throw new UnauthorizedException('Password not match');

      const { access_token, refresh_token } =
        await this.generateJwtToken.execute(user);

      res.cookie('access_token', access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 7 * 24,
        path: '/',
        sameSite: 'lax',
      });

      return res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, 'Login successfully', null));
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(DynamicOAuthGuard)
  @Get(':provider')
  async handleOAuth(
    @Param('provider') _provider: string,
    @Req() _req: Request,
  ) {}

  @UseGuards(DynamicOAuthGuard)
  @Get(':provider/callback')
  async handleOAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Param('provider') provider: string,
    @Query('code') code: string,
  ) {
    let user: UserResponse;

    const { email, password, username } = (req as any).user as RegisterDTO;

    try {
      user = await this.findByEmail.execute(email);

      if (user == null) {
        const result = await this.oAuthHandler.execute({
          email,
          password,
          username,
          provider,
        });

        if (result != null) {
          this.eventEmitter.emit('user.oauth', user);

          user = result;
        } else {
          throw new InternalServerErrorException();
        }
      }

      const { access_token, refresh_token } =
        await this.generateJwtToken.execute(user);

      res.cookie('access_token', access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 7 * 24,
        path: '/',
        sameSite: 'lax',
      });

      return res
        .status(HttpStatus.OK)
        .json(new ApiResponse(HttpStatus.OK, 'OAuth success', null));
    } catch (error) {
      throw error;
    }
  }
}
