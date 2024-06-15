import { StatusCodes } from 'http-status-codes';
import { CustomError, ERROR_TYPES } from './custom.error';
import messages from '@server/messages';

// Database Error
export class DatabaseError extends CustomError {
  override type: ERROR_TYPES = 'ERROR';
  private readonly _code: number = StatusCodes.INTERNAL_SERVER_ERROR;
  private readonly _logging: boolean = false;
  private readonly _context: { [key: string]: any };

  constructor(params?: {
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    const { logging } = params || {};
    super(messages.error.databaseConnection);
    this._logging = logging || false;
    this._context = params?.context || {};
    Object.setPrototypeOf(this, DatabaseError.prototype);
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
