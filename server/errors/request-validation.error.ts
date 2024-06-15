import { ValidationError } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { ERROR_TYPES, MultipleCustomError } from './custom.error';
import messages from '@server/messages';

export class RequestVaidationError extends MultipleCustomError {
  override type: ERROR_TYPES = 'VALIDATION_ERROR';
  override logging: boolean = false;
  private readonly _validationErrors: ValidationError[] = [];
  private readonly _code: number = StatusCodes.BAD_REQUEST;

  constructor(validationErrors: ValidationError[]) {
    super(messages.error.badRequest);
    this._validationErrors = validationErrors;
    Object.setPrototypeOf(this, RequestVaidationError.prototype);
  }

  get response() {
    return this._validationErrors.map((err: any) => {
      return { message: err.msg, field: err.path };
    });
  }

  get statusCode() {
    return this._code;
  }
}
