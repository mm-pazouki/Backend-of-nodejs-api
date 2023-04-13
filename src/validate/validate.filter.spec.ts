import { ValidationFilter } from './validate.filter';
import { ArgumentsHost, BadRequestException } from '@nestjs/common';

describe('ValidationFilter', () => {
  let filter: ValidationFilter;

  beforeEach(() => {
    filter = new ValidationFilter();
  });

  describe('catch', () => {
    it('should set the response status code to 400', () => {
      const exception = new BadRequestException('Validation failed');
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const host = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => response,
        }),
      };

      filter.catch(exception, host as unknown as ArgumentsHost);

      expect(response.status).toHaveBeenCalledWith(400);
    });

    it('should set the response body with the validation errors', () => {
      const exception = new BadRequestException('Validation failed');
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const host = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => response,
        }),
      };
      const errors = [{ field: 'name', message: 'Name is required' }];
      exception.getResponse = jest.fn().mockReturnValue(errors);

      filter.catch(exception, host as unknown as ArgumentsHost);

      expect(response.json).toHaveBeenCalledWith({
        statusCode: 400,
        errors,
      });
    });

    it('should set the response body with a single validation error', () => {
      const exception = new BadRequestException('Validation failed');
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const host = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => response,
        }),
      };
      const error = { field: 'name', message: 'Name is required' };
      exception.getResponse = jest.fn().mockReturnValue(error);

      filter.catch(exception, host as unknown as ArgumentsHost);

      expect(response.json).toHaveBeenCalledWith({
        statusCode: 400,
        errors: [error],
      });
    });
  });
});
