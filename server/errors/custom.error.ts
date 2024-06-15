export type CustomErrorContent = {
  message: string;
  field?: string;
  context?: { [key: string]: any };
};

export type ERROR_TYPES = 'ERROR' | 'VALIDATION_ERROR';

abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly logging: boolean;
  abstract readonly type: ERROR_TYPES;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

// Single Custom Error
export abstract class CustomError extends BaseError {
  abstract readonly context?: { [key: string]: any };
  abstract readonly response: CustomErrorContent;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Multiple Custom Error
export abstract class MultipleCustomError extends BaseError {
  abstract readonly response: CustomErrorContent[];

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MultipleCustomError.prototype);
  }
}
