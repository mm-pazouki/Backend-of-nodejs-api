import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errors = exception.getResponse();
    response.status(400).json({
      statusCode: 400,
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }
}
