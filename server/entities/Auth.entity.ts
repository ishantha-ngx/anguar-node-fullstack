import {
  Entity,
  Column,
  Index,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppBaseEntity } from './_AppBaseEntity';
import { EmailConfirmation } from './EmailConfirmation.entity';
import { User } from './User.entity';
import { AuthDTO } from '@server/dto';

@Entity()
@Index(['username'], { unique: true })
export class Auth extends AppBaseEntity {
  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column()
  passwordSalt!: string;

  @OneToOne(() => User, (user: User) => user.auth)
  @JoinColumn()
  user!: User;

  @OneToMany(
    () => EmailConfirmation,
    (emailConfirmation: EmailConfirmation) => emailConfirmation.auth
  )
  emailConfirmationTokens?: EmailConfirmation[];

  async setHashPassword(password: string) {
    this.passwordSalt = bcrypt.genSaltSync();
    this.password = bcrypt.hashSync(password, this.passwordSalt);
  }

  async validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }

  // Utility method to convert entity to DTO
  toDTO<T>(
    user: User,
    token: { accessToken: string; refreshToken: string }
  ): T {
    return {
      user: user.toDTO(),
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    } as T;
  }
}
