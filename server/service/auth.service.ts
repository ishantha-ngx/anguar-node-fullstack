import { LoginPayload, RegisterPayload } from '../payloads/user.payload';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@server/errors';
import { AuthDTO } from '@server/dto';
import { Auth, User } from '@server/entities';
import { Encrypt } from '@server/utils';
import messages from '@server/messages';
import { AppDataSource } from '@server/config';
import { BaseService, IBaseService } from './base.service';
import { Equal } from 'typeorm';

export interface IAuthService extends IBaseService<Auth> {
  login(payload: LoginPayload): Promise<AuthDTO>;
  register(payload: RegisterPayload): Promise<AuthDTO>;
  findByUsername(username: string): Promise<Auth | null>;
}

export class AuthService extends BaseService<Auth> implements IAuthService {
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
    const tokens = Encrypt.generateToken(auth.user);
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

  // Find auth by username
  findByUsername = async (username: string): Promise<Auth | null> => {
    return await this.repository.findOne({
      where: { username: Equal(username) },
    });
  };
}

export default AuthService;
