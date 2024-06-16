import { Entity, Column, ManyToMany } from 'typeorm';
import { AppBaseEntity } from './_AppBaseEntity';
import { Role } from './Role.entity';

@Entity()
export class Permission extends AppBaseEntity {
  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column()
  description?: string;

  @ManyToMany(() => Role, (role: Role) => role.permissions)
  roles?: Role[];

  toDTO<T>(): T {
    const { id, code, name, description } = this;
    return {
      id,
      code,
      name,
      description,
    } as T;
  }
}
