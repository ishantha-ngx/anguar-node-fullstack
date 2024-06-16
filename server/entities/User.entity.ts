import {
  Entity,
  Column,
  Index,
  ManyToMany,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { AppBaseEntity } from './_AppBaseEntity';
import { UserStatus } from '@server/enums';
import { Role } from './Role.entity';
import { Auth } from './Auth.entity';
import { UserDTO } from '@server/dto';

@Entity()
@Index(['email'], { unique: true })
export class User extends AppBaseEntity {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({ default: false })
  emailConfirmed: boolean = false;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'user_roles',
  })
  roles?: Role[];

  @OneToOne(() => Auth, (auth: Auth) => auth.user) // specify inverse side as a second parameter
  auth?: Auth;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status!: UserStatus;

  toDTO<T>(): T {
    const { id, firstName, lastName, email } = this;
    return {
      id,
      email,
      firstName,
      lastName,
    } as T;
  }
}
