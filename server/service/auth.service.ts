import { LoginPayload, RegisterPayload } from '../payloads/user.payload';
import { StatusCodes } from 'http-status-codes';
import { Equal } from 'typeorm';
import { BadRequestError } from '@server/errors';
import { AuthDTO } from '@server/dto';
import { Auth, RefreshToken, User } from '@server/entities';
import { Encrypt, checkUserStatus } from '@server/utils';
import messages from '@server/messages';
import { AppDataSource } from '@server/config';
import { BaseService, IBaseService } from './base.service';

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
      throw new BadRequestError({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.authenticationFailed,
      });
    }

    const isPasswordValid = Encrypt.comparepassword(auth.password, password);
    if (!isPasswordValid) {
      throw new BadRequestError({
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

        // TODO: Send confirmation email
        // await AuthController.sendConfirmationEmail(user);

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
      throw new BadRequestError({
        code: StatusCodes.FORBIDDEN,
        message: 'Invalid token',
      });
    }

    if (refreshTokenEntity.expiryDate < new Date()) {
      await this.refreshTokenReposotory.remove(refreshTokenEntity);
      throw new BadRequestError({
        code: StatusCodes.FORBIDDEN,
        message: 'Invalid token',
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
}

export default AuthService;
