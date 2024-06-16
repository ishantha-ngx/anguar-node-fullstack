import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { AppBaseEntity } from './_AppBaseEntity';
import { Permission } from './Permission.entity';
import { User } from './User.entity';

@Entity()
export class Role extends AppBaseEntity {
  @Column()
  name!: string;

  @ManyToMany(() => User, (user) => user.roles)
  users?: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
  })
  permissions?: Permission[];

  toDTO<T>(): T {
    const { id, name } = this;
    return {
      id,
      name,
    } as T;
  }
}
