import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ApiResponse } from '@/common/response/api';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { InvalidInputError } from '@/common/exceptions/invalid-input.error';
import { User } from '@/common/decorator/user.decorator';
import { UserPayload } from '@/common/interface/user-payload';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { UserUpdate } from '@/shared/interface/update-payload';

import { HandlerService } from '../../application/handler/handler-service';
import { FindByEmail } from '../../application/use-case/find-by-email';
import { DeleteUser } from '../../application/use-case/delete-user';
import { FindById } from '../../application/use-case/find-by-id';
import { FindAll } from '../../application/use-case/find-all';
import { UpdateUserDTO } from '../dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly deleteUser: DeleteUser,
    private readonly eventEmitter: EventEmitter2,
    private readonly findByEmail: FindByEmail,
    private readonly findAll: FindAll,
    private readonly findById: FindById,
    private readonly handlerService: HandlerService,
  ) {}

  @UseGuards(AdminAuthGuard)
  @Get()
  async findAllUser() {
    try {
      const user = await this.findAll.execute();

      return new ApiResponse(HttpStatus.OK, 'User found', user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:email')
  async deleteUserByEmail(@Param('email') email: string) {
    try {
      const user = await this.findByEmail.execute(email);
      if (user == null) throw new BadRequestException('User not found');

      const result = await this.deleteUser.execute(user);
      if (!result) throw new InternalServerErrorException();

      return new ApiResponse(HttpStatus.OK, 'Delete user success', result);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  async findUserById(@Param('userId') userId: string) {
    try {
      const user = await this.findById.execute(userId);
      if (user == null) throw new BadRequestException('User not found');

      return new ApiResponse(HttpStatus.OK, 'User found', user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:email')
  async findUserByEmail(@Param('email') email: string) {
    try {
      const user = await this.findByEmail.execute(email);
      if (user == null) throw new BadRequestException('User not found');

      return new ApiResponse(HttpStatus.OK, 'User found', user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/action/:action')
  async updateUser(
    @Param('action') action: string,
    @Body() data: UpdateUserDTO,
    @User() currentUser: UserPayload,
  ) {
    const {
      email,
      is_verified,
      password,
      role,
      username,
      current_password,
      provider,
    } = data;

    const payload: UserUpdate = {
      email,
      is_verified,
      password,
      role,
      username,
      current_password,
      provider,
    };

    try {
      const user = await this.findByEmail.execute(currentUser.email);
      if (user == null) throw new BadRequestException('User not found');

      const result = await this.handlerService.handleUserAction(
        action,
        user,
        payload,
      );

      if (result && email != undefined) {
        this.eventEmitter.emit('user.email_has_been_change');
      } else if (result && password != undefined) {
        this.eventEmitter.emit('user.password_has_been_change');
      }

      return new ApiResponse(HttpStatus.OK, 'User updated', true);
    } catch (error) {
      if (error instanceof InvalidInputError) {
        if (error.message === 'Password not match') {
          throw new UnauthorizedException(error.message);
        } else {
          throw new BadRequestException(error.message);
        }
      }

      throw error;
    }
  }
}
