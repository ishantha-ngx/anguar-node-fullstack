import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUserService, UserService } from '@server/service';
import { Encrypt, checkUserStatus } from '@server/utils';
import { ErrorResponse } from '@server/errors';
import { Equal } from 'typeorm';
import { User } from '@server/entities';
import messages from '@server/messages';
import { UserStatus } from '@server/enums';

export interface AuthRequest extends Request {
  cookies: {
    [key: string]: string;
  };
  user?: User;
}

export const auth = async (
  req: AuthRequest,
  _: Response,
  next: NextFunction
) => {
  const access_token = req.cookies?.access_token;
  if (!access_token) {
    next(
      new ErrorResponse({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.auth.notLoggedIn,
      })
    );
  } else if (typeof access_token !== 'undefined') {
    try {
      // Verify token
      const verify = Encrypt.verifyToken(access_token, false);

      const user = await (new UserService() as IUserService).findOne({
        where: { id: Equal(verify?.sub as string) },
      });

      if (!user) {
        throw new ErrorResponse({
          code: StatusCodes.UNAUTHORIZED,
          message: messages.error.authenticationFailed,
        });
      }

      // Check valid user status
      checkUserStatus(user);

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next(
      new ErrorResponse({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.auth.missing,
      })
    );
  }
};
