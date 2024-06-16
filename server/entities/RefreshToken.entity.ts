import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AppBaseEntity } from './_AppBaseEntity';
import { Auth } from './Auth.entity';

@Entity()
export class RefreshToken extends AppBaseEntity {
  @Column()
  token!: string;

  @ManyToOne(() => Auth, (auth: Auth) => auth.refreshTokens)
  auth!: Auth;

  @Column()
  expiryDate!: Date;

  toDTO<T>(): T {
    const { id, token } = this;
    return {
      id,
      token,
    } as T;
  }
}
