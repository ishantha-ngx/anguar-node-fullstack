import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUserService, UserService } from '@server/service';
import { Encrypt } from '@server/utils';
import { BadRequestError } from '@server/errors';
import { Equal } from 'typeorm';

export const auth = async (req: Request, _: Response, next: NextFunction) => {
  let access_token;
  console.log(req.cookies);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    access_token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.access_token) {
    access_token = req.cookies?.access_token;
  }

  console.log('access_token');
  console.log(access_token);
  if (!access_token) {
    next(
      new BadRequestError({
        code: StatusCodes.UNAUTHORIZED,
        message: 'You are not logged in',
      })
    );
  } else if (typeof access_token !== 'undefined') {
    console.log('XXX');
    const verify = Encrypt.verifyToken(access_token, false);
    console.log(verify);

    const user = await (new UserService() as IUserService).findOne({
      where: { id: Equal(verify?.sub as string) },
    });
    //   const auth = await authService.get({
    //     user_id: Number(verify?.sub),
    //   });

    //   if (!(auth && auth.length)) {
    //     throw new BadRequestError({
    //       code: StatusCodes.UNAUTHORIZED,
    //       message: 'Invalid token',
    //     });
    //   }
    (req as any)['user'] = user;
    next();
  } else {
    next(
      new BadRequestError({
        code: StatusCodes.UNAUTHORIZED,
        message: 'Missing authentication',
      })
    );
  }
};
