import { User } from '@server/entities';
import { BaseService, IBaseService } from './base.service';
import { AppDataSource } from '@server/config';
import { Equal } from 'typeorm';

export interface IUserService extends IBaseService<User> {
  findByEmail(email: string): Promise<User | null>;
}

export class UserService extends BaseService<User> implements IUserService {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  // Find user by email
  findByEmail = async (email: string): Promise<User | null> => {
    return await this.repository.findOne({
      where: { email: Equal(email) },
    });
  };
}

export default UserService;
