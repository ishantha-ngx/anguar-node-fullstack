import { StatusCodes } from 'http-status-codes';
import { CookieOptions, Request, Response } from 'express';
import { AuthDTO, UserDTO } from '@server/dto';
import { AuthService, IUserService, UserService } from '@server/service';
import { LoginPayload, RegisterPayload } from '@server/payloads';
import { runValidation } from '@server/validation';
import { BaseController } from './base.controller';
import { User } from '@server/entities';
import { SuccessDTO } from '@server/dto/success.dto';
import messages from '@server/messages';

class UserController extends BaseController<User> {
  private readonly authService: AuthService;

  constructor() {
    super(User, UserDTO);
    this.authService = new AuthService();
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
    expires: new Date(Date.now() + 10 * 60 * 1000),
    maxAge: 10 * 60 * 1000,
  };

  private static readonly bindResponseTokenCookies = (
    res: Response,
    authResponse: AuthDTO
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

    const authResponse: AuthDTO = await this.authService.login(req.body);
    UserController.bindResponseTokenCookies(res, authResponse);

    return res.status(StatusCodes.OK).json(authResponse.user);
  };

  // Register
  register = async (
    req: Request<RegisterPayload>,
    res: Response<SuccessDTO>
  ) => {
    runValidation(req);
    await this.authService.register(req.body);
    return res
      .status(StatusCodes.OK)
      .json(new SuccessDTO(messages.success.registrationSuccess));
  };

  // Refresh token
  refreshToken = async (req: Request, res: Response) => {
    runValidation(req);
    const refreshToken = req.cookies?.refresh_token;
    const authResponse: AuthDTO = await this.authService.refreshToken(
      refreshToken
    );
    return res.status(StatusCodes.OK).json(authResponse);
  };

  // Confirm email address
  confirmEmailAddress = async (req: Request, res: Response) => {
    const { token } = req.params;
    await this.authService.confirmEmailAddress(token);
    return res
      .status(StatusCodes.OK)
      .json(new SuccessDTO(messages.success.accountActivated));
  };
}

export default UserController;
