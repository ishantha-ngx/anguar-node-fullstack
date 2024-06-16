import { StatusCodes } from 'http-status-codes';
import { CookieOptions, Request, Response } from 'express';
import { AuthDTO, UserDTO } from '@server/dto';
import { AuthService, IUserService, UserService } from '@server/service';
import { LoginPayload, RegisterPayload } from '@server/payloads';
import { runValidation } from '@server/validation';
import { BaseController } from './base.controller';
import { User } from '@server/entities';

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
  register = async (req: Request<RegisterPayload>, res: Response) => {
    runValidation(req);

    const authResponse: AuthDTO = await this.authService.register(req.body);

    // TODO: Remove auto login. (Remove after email verification process)
    // Bind coolies
    UserController.bindResponseTokenCookies(res, authResponse);
    return res.status(StatusCodes.OK).json(authResponse);
  };

  // Refresh token
  refreshToken = async (req: Request, res: Response) => {
    // runValidation(req);

    const refreshToken = req.cookies?.refresh_token;
    const authResponse: AuthDTO = await this.authService.refreshToken(
      refreshToken
    );
    return res.status(StatusCodes.OK).json(authResponse);
  };
}

export default UserController;

// import { v4 as uuidv4 } from 'uuid';
// static async sendConfirmationEmail(user: User) {
//   const token = new EmailConfirmationToken();
//   token.token = uuidv4();
//   token.user = user;
//   await token.save();

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'your_email@gmail.com',
//       pass: 'your_email_password'
//     }
//   });

//   const mailOptions = {
//     from: 'your_email@gmail.com',
//     to: user.email,
//     subject: 'Email Confirmation',
//     text: `Please confirm your email by clicking the following link: http://localhost:3000/api/confirm/${token.token}`
//   };

//   await transporter.sendMail(mailOptions);
// }

// static async confirmEmail(req: Request, res: Response) {
//   const { token } = req.params;

//   const confirmationToken = await EmailConfirmationToken.findOne({ where: { token }, relations: ['user'] });
//   if (!confirmationToken) {
//     return res.status(400).json({ message: 'Invalid token' });
//   }

//   const user = confirmationToken.user;
//   user.isEmailConfirmed = true;
//   await user.save();

//   await EmailConfirmationToken.delete({ id: confirmationToken.id });

//   res.json({ message: 'Email confirmed successfully' });
// }
