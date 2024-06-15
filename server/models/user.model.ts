import { LoginPayload, RegisterPayload } from '../payloads/user.payload';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@server/errors';
import { AuthResponse } from '@server/dto';
import { User } from '@server/entities';
import { Encrypt } from '@server/utils';
import messages from '@server/messages';
import { BaseModel, IBaseModel } from './base.model';

export interface IUserModel extends IBaseModel<typeof User> {
  login(payload: LoginPayload): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  findByEmail(email: string): Promise<User>;
}

export class UserModel extends BaseModel<typeof User> implements IUserModel {
  constructor() {
    super(User);
  }

  //   Login
  login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const { email, password } = payload;

    const user = await this.repository.findOneBy({ email });
    if (!user) {
      throw new BadRequestError({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.authenticationFailed,
      });
    }

    const isPasswordValid = Encrypt.comparepassword(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestError({
        code: StatusCodes.UNAUTHORIZED,
        message: messages.error.authenticationFailed,
      });
    }
    const tokens = Encrypt.generateToken(user);
    return new AuthResponse(user, tokens);
  };

  //   Register
  register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { email, password } = payload;
    const encryptedPassword = await Encrypt.encryptpass(password);

    const user = new User();
    user.email = email;
    user.password = encryptedPassword;
    await this.repository.save(user);

    // Generate auth token
    const tokens = Encrypt.generateToken(user);
    return new AuthResponse(user, tokens);
  };

  // Find user by email
  findByEmail = async (email: string): Promise<User> => {
    return await this.repository.findOne({
      where: { email },
    });
  };
}

export default UserModel;
