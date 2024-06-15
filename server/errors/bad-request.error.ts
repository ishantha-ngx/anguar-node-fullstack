import { StatusCodes } from 'http-status-codes';
import messages from '@server/messages';
import { CustomError, ERROR_TYPES } from './custom.error';

// Bad Request Error
export class BadRequestError extends CustomError {
  override type: ERROR_TYPES = 'ERROR';
  private static readonly _statusCode = StatusCodes.BAD_REQUEST;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: any };

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    const { code, message, logging } = params || {};

    super(message || messages.error.badRequest);
    this._code = code || BadRequestError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
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
