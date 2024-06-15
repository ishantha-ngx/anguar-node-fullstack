import { StatusCodes } from 'http-status-codes';
import { CustomError, ERROR_TYPES } from './custom.error';
import messages from '@server/messages';

export class UrlNotFoundError extends CustomError {
  override type: ERROR_TYPES = 'ERROR';
  private readonly _code: number = StatusCodes.NOT_FOUND;
  private readonly _logging: boolean = false;
  private readonly _context: { [key: string]: any } = {};

  constructor() {
    super(messages.error.urlNotFound);
    Object.setPrototypeOf(this, UrlNotFoundError.prototype);
  }

  get response() {
    return { message: this.message };
  }

  get context() {
    return this._context;
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
