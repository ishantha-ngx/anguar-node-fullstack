import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomError, MultipleCustomError } from '@server/errors';
import messages from '@server/messages';
import { isProdEnv } from '@server/config';

// Handle log
export const handleLoging = (log: Object) => {
  console.error(JSON.stringify(log, null, 2));
};

// Aync error handler
export const asyncErrorHandler = (func: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err: any) => next(err));
  };
};

// Error Handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handled errors
  handleLoging(err);
  const isCustomErrorInstance = err instanceof CustomError;
  const isMultipleCustomErrorInstance = err instanceof MultipleCustomError;

  if (isCustomErrorInstance || isMultipleCustomErrorInstance) {
    const { statusCode, logging, response } = err;

    const responseObj = isCustomErrorInstance
      ? {
          error: response,
        }
      : {
          errors: response,
        };

    // If loging enabled
    if (logging) {
      handleLoging({
        code: err.statusCode,
        stack: err.stack,
        ...responseObj,
      });
    }

    return res
      .status(statusCode)
      .send({ type: err.type || 'ERROR', statusCode, ...responseObj });
  }

  // Unhandled errors
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    type: 'ERROR',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    error: {
      message: messages.error.internalServerError,
      ...(!isProdEnv ? { details: err } : {}),
    },
  });
};
