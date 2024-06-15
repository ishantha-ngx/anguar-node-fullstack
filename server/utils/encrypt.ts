import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from '@server/entities';

export class Encrypt {
  static async encryptpass(password: string) {
    return bcrypt.hashSync(password, 12);
  }
  static comparepassword(hashPassword: string, password: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  static verifyToken(token: string, isRefreshToken: boolean) {
    const accessTokenSecret: jwt.Secret = process.env
      .ACESS_TOKEN_SECRET as string;
    const refreshTokenSecret: jwt.Secret = process.env
      .REFRESH_TOKEN_SECRET as string;

    if (isRefreshToken) {
      return jwt.verify(token, refreshTokenSecret!);
    } else {
      return jwt.verify(token, accessTokenSecret!);
    }
  }

  static generateToken(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessTokenSecret: jwt.Secret = process.env
      .ACESS_TOKEN_SECRET as string;
    const refreshTokenSecret: jwt.Secret = process.env
      .REFRESH_TOKEN_SECRET as string;

    const accessTokenPrivateKey = Buffer.from(
      accessTokenSecret,
      'base64'
    ).toString('ascii');
    const refreshTokenPrivateKey = Buffer.from(
      refreshTokenSecret,
      'base64'
    ).toString('ascii');

    const accessToken = jwt.sign({ sub: user.id }, accessTokenPrivateKey, {
      expiresIn: '1d',
    });

    const refreshToken = jwt.sign({ sub: user.id }, refreshTokenPrivateKey, {
      expiresIn: '1d',
    });

    return { accessToken, refreshToken };
  }
}
