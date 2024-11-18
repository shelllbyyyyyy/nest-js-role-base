import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { getStatus } from '../response/api';

interface ErrorResponse {
  message: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    let responseBody: {
      code: number;
      errors: string;
      message: string;
      data: any;
    };
    let httpStatus: number;
    const userEmail = request.user?.email || request.body?.username || '';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const message = (exception.getResponse() as ErrorResponse).message;
      const status = exception.getStatus();
      responseBody = {
        code: status,
        errors: getStatus(status),
        message: message.toString(),
        data: null,
      };

      this.logger.error(`[${userEmail}] ${exception.message}`);
    } else {
      this.logger.error(`[${userEmail}] ${exception}`);

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        code: 500,
        errors: 'Internal Server Error',
        message: 'internal server error',
        data: null,
      };
    }

    response.status(httpStatus).json(responseBody);
  }
}
