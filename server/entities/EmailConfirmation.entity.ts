import { Entity, Column, ManyToOne } from 'typeorm';
import { AppBaseEntity } from './_AppBaseEntity';
import { Auth } from './Auth.entity';

@Entity()
export class EmailConfirmation extends AppBaseEntity {
  @Column()
  token!: string;

  @ManyToOne(() => Auth, (auth: Auth) => auth.emailConfirmationTokens, {
    onDelete: 'CASCADE',
  })
  auth!: Auth;

  toDTO<T>(): T {
    const { id, token } = this;
    return {
      id,
      token,
    } as T;
  }
}
