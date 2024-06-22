import { LoginPayload, RegisterPayload } from '../payloads/user.payload';
import { StatusCodes } from 'http-status-codes';
import { Equal } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from '@server/errors';
import { AuthDTO } from '@server/dto';
import { Auth, EmailConfirmation, RefreshToken, User } from '@server/entities';
import {
  EmailSender,
  Encrypt,
  checkUserStatus,
  emailContentTemplate,
  emailSubjects,
  emailUrls,
  noReplyEmail,
  replacePlaceholders,
} from '@server/utils';
import messages from '@server/messages';
import { AppDataSource } from '@server/config';
import { BaseService, IBaseService } from './base.service';
import { UserStatus } from '@server/enums';

export interface IAuthService extends IBaseService<Auth> {
  login(payload: LoginPayload): Promise<AuthDTO>;
  register(payload: RegisterPayload): Promise<AuthDTO>;
  findByUsername(username: string): Promise<Auth | null>;
  refreshToken(token: string): Promise<AuthDTO>;
  getRefreshToken(token: string): Promise<RefreshToken | null>;
}

export class AuthService extends BaseService<Auth> implements IAuthService {
  private readonly refreshTokenReposotory =
    AppDataSource.getRepository(RefreshToken);
  private readonly emailConfirmationReposotory =
    AppDataSource.getRepository(EmailConfirmation);
  constructor() {
    super(AppDataSource.getRepository(Auth));
  }

  //   Login
  login = async (payload: LoginPayload): Promise<AuthDTO> => {
    const { username, email, password } = payload;
    const auth = await this.repository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user')
      .where('user.email = :email', { email })
      .orWhere('auth.username = :username', { username })
      .getOne();

    if (!auth) {
      throw new ErrorResponse({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.authenticationFailed,
      });
    }

    const isPasswordValid = Encrypt.comparepassword(auth.password, password);
    if (!isPasswordValid) {
      throw new ErrorResponse({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.authenticationFailed,
      });
    }

    // Check valid user status
    checkUserStatus(auth.user);

    // Generate tokens
    const tokens = Encrypt.generateToken(auth.user);

    // Save refresh token in DB
    await this.saveRefreshToken(tokens.refreshToken, auth);

    return new AuthDTO(auth.user, tokens);
  };

  //   Register
  register = async (payload: RegisterPayload): Promise<AuthDTO> => {
    const entityManager = AppDataSource.manager;

    const { firstName, lastName, email, username, password } = payload;

    // Manage transaction when saving both user and auth records
    return await entityManager.transaction(
      async (transactionalEntityManager) => {
        // Save User
        const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        await transactionalEntityManager.save(user);

        // Save Auth
        const auth = new Auth();
        auth.username = username;
        auth.setHashPassword(password);
        auth.user = user;

        await transactionalEntityManager.save(auth);

        // Save email confirmation
        const emailConfirmation = new EmailConfirmation();
        emailConfirmation.auth = auth;
        emailConfirmation.token = uuidv4();

        await transactionalEntityManager.save(emailConfirmation);

        // Send confirmation email
        this.sendEmailConfirmationEmail(user, emailConfirmation);

        // Generate auth token
        const tokens = Encrypt.generateToken(user);
        return new AuthDTO(user, tokens);
      }
    );
  };

  // refresh token
  refreshToken = async (token: string): Promise<AuthDTO> => {
    const refreshTokenEntity: RefreshToken | null =
      await this.refreshTokenReposotory.findOne({
        where: { token },
        relations: ['auth', 'auth.user'],
      });

    if (!refreshTokenEntity) {
      throw new ErrorResponse({
        code: StatusCodes.FORBIDDEN,
        message: messages.error.token.invalid,
      });
    }

    if (refreshTokenEntity.expiryDate < new Date()) {
      await this.refreshTokenReposotory.remove(refreshTokenEntity);
      throw new ErrorResponse({
        code: StatusCodes.FORBIDDEN,
        message: messages.error.token.invalid,
      });
    }

    // Verify token
    Encrypt.verifyToken(token, true);

    // Generate auth token
    const tokens = Encrypt.generateToken(refreshTokenEntity.auth.user);

    // Update refresh token in DB
    await this.updateRefreshToken(tokens.refreshToken, refreshTokenEntity);

    return new AuthDTO(refreshTokenEntity.auth.user, tokens);
  };

  // Find auth by username
  findByUsername = async (username: string): Promise<Auth | null> => {
    return await this.repository.findOne({
      where: { username: Equal(username) },
    });
  };

  // Get refresh token
  getRefreshToken = async (token: string): Promise<RefreshToken | null> => {
    return await this.refreshTokenReposotory.findOne({
      where: { token: Equal(token) },
    });
  };

  // Confirm email address
  confirmEmailAddress = async (token: string): Promise<boolean> => {
    const emailConfirmObj: EmailConfirmation | null =
      await this.emailConfirmationReposotory.findOne({
        where: { token: Equal(token) },
        relations: ['auth', 'auth.user'],
      });

    if (!emailConfirmObj) {
      throw new ErrorResponse({
        code: StatusCodes.BAD_REQUEST,
        message: messages.error.auth.confirmTokenInvalid,
      });
    }

    const user = emailConfirmObj.auth.user;
    user.emailConfirmed = true;
    user.status = UserStatus.ACTIVE;
    await user.save();

    await this.emailConfirmationReposotory.delete({ id: emailConfirmObj.id });
    return true;
  };

  // Save refresh token in DB
  private saveRefreshToken = async (refreshToken: string, auth: Auth) => {
    const refreshTokenExpireTimeInHours = parseInt(
      process.env.REFRESH_JWT_EXPIRE as string,
      10
    );
    const newRefreshToken = this.refreshTokenReposotory.create({
      token: refreshToken,
      auth: auth,
      expiryDate: new Date(
        Date.now() + refreshTokenExpireTimeInHours * 60 * 60 * 1000
      ),
    });
    return await this.refreshTokenReposotory.save(newRefreshToken);
  };

  // Update new refresh token in DB
  private updateRefreshToken = async (
    refreshToken: string,
    entity: RefreshToken
  ) => {
    const refreshTokenExpireTimeInHours = parseInt(
      process.env.REFRESH_JWT_EXPIRE as string,
      10
    );
    entity.token = refreshToken;
    entity.expiryDate = new Date(
      Date.now() + refreshTokenExpireTimeInHours * 60 * 60 * 1000
    );
    return await entity.save();
  };

  // Send email confirmation email
  private sendEmailConfirmationEmail = async (
    user: User,
    emailConfirmation: EmailConfirmation
  ) => {
    const emailSender = new EmailSender();
    emailSender.sendEmail({
      from: noReplyEmail,
      to: user.email,
      subject: emailSubjects.confirmEmail,
      template: emailContentTemplate.confirmEmail,
      context: {
        firstName: user.firstName,
        lastName: user.lastName,
        url: replacePlaceholders(emailUrls.confirmEmail, {
          token: emailConfirmation.token,
        }),
      },
    });
  };
}

export default AuthService;
