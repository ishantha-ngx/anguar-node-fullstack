import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from '@server/entities';
import { ErrorResponse } from '@server/errors';
import { StatusCodes } from 'http-status-codes';
import messages from '@server/messages';

export class Encrypt {
  private static readonly jwtTokenSecret: jwt.Secret = process.env
    .JWT_SECRET as string;
  private static readonly jwtTokenExpire: string = `${
    process.env.JWT_EXPIRE as string
  }h`; // JWT in hours
  private static readonly refreshTokenSecret: jwt.Secret = process.env
    .REFRESH_JWT_SECRET as string;
  private static readonly refreshTokenExpire: string = `${
    process.env.REFRESH_JWT_EXPIRE as string
  }h`; // JWT REFRESH TOKEN in hours

  static comparepassword(hashPassword: string, password: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  // Verify JWT token
  static verifyToken(token: string, isRefreshToken: boolean) {
    try {
      const publicKey = isRefreshToken
        ? this.refreshTokenSecret
        : this.jwtTokenSecret;
      return jwt.verify(token, publicKey);
    } catch (error) {
      if (!isRefreshToken && error instanceof jwt.TokenExpiredError) {
        throw new ErrorResponse({
          code: StatusCodes.UNAUTHORIZED,
          message: messages.error.token.expired,
        });
      }
      throw new ErrorResponse({
        code: StatusCodes.FORBIDDEN,
        message: messages.error.token.invalid,
      });
    }
  }

  // Generate JWT token
  static generateToken(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign({ sub: user.id }, this.jwtTokenSecret, {
      expiresIn: this.jwtTokenExpire,
    });

    const refreshToken = jwt.sign({ sub: user.id }, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpire,
    });

    return { accessToken, refreshToken };
  }
}
