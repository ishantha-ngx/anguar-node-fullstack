import { Entity, Column, Index } from 'typeorm';
import { Base } from './Base.entity';

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
export class User extends Base {
  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  isAdmin?: boolean;
}
