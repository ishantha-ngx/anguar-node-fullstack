import { StatusCodes } from 'http-status-codes';
import { CookieOptions, Request, Response } from 'express';
import { AuthResponse, UserResponce } from '@server/dto';
import { IUserModel, UserModel } from '@server/models';
import { LoginPayload, RegisterPayload } from '@server/payloads';
import { runValidation } from '@server/validation';
import BaseController from './base.controller';

class UserController extends BaseController<IUserModel> {
  constructor() {
    super({
      model: UserModel,
      dto: UserResponce,
    });
  }

  private static readonly cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    ...(process.env.NODE_ENV === 'production' && {
      secure: true,
    }),
  };

  private static readonly accessTokenCookieOptions: CookieOptions = {
    ...this.cookiesOptions,
    expires: new Date(Date.now() + 1 * 60 * 1000),
    maxAge: 1 * 60 * 1000,
  };

  private static readonly refreshTokenCookieOptions: CookieOptions = {
    ...this.cookiesOptions,
    expires: new Date(Date.now() + 1 * 60 * 1000),
    maxAge: 1 * 60 * 1000,
  };

  private static readonly bindResponseTokenCookies = (
    res: Response,
    authResponse: AuthResponse
  ) => {
    res.cookie(
      'access_token',
      authResponse.accessToken,
      UserController.accessTokenCookieOptions
    );
    res.cookie(
      'refresh_token',
      authResponse.refreshToken,
      UserController.refreshTokenCookieOptions
    );
    res.cookie('logged_in', true, {
      ...UserController.accessTokenCookieOptions,
      httpOnly: false,
    });
  };

  // Login
  login = async (req: Request<LoginPayload>, res: Response) => {
    runValidation(req);

    const authResponse: AuthResponse = await this.model.login(req.body);
    UserController.bindResponseTokenCookies(res, authResponse);

    return res.status(StatusCodes.OK).json(authResponse.user);
  };

  // Register
  register = async (req: Request<RegisterPayload>, res: Response) => {
    runValidation(req);

    const authResponse: AuthResponse = await this.model.register(req.body);
    UserController.bindResponseTokenCookies(res, authResponse);
    return res.status(StatusCodes.OK).json(authResponse);
  };

  // Refresh token
  refresh = async (req: Request<RegisterPayload>, res: Response) => {
    // runValidation(req);
    const authResponse: AuthResponse = await this.model.register(req.body);
    return res.status(StatusCodes.OK).json(authResponse);
  };
}

export default UserController;
