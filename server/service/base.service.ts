import { AppBaseEntity } from '@server/entities/_AppBaseEntity';
import {
  DeepPartial,
  DeleteResult,
  Equal,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

export interface IBaseService<T> {
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(options: FindOneOptions<T>, data: DeepPartial<T>): Promise<T | null>;
  delete(id: string): Promise<DeleteResult>;
}

export class BaseService<T extends AppBaseEntity> implements IBaseService<T> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    // , entity: { new (): T }
    this.repository = repository;
  }

  // Find by ID
  findById = async (id: string): Promise<T | null> => {
    return this.repository.findOne({ id: Equal(id) } as FindOneOptions<T>);
  };

  // Find one
  findOne = async (options: FindOneOptions<T>): Promise<T | null> => {
    return this.repository.findOne(options);
  };

  // Find All
  findAll = async (options?: FindManyOptions<T>): Promise<T[]> => {
    return this.repository.find(options);
  };

  // Create
  create = async (data: DeepPartial<T>): Promise<T> => {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  };

  // Update
  update = async (
    options: FindOneOptions<T>,
    data: DeepPartial<T>
  ): Promise<T | null> => {
    const entity = await this.repository.findOne(options as FindOneOptions<T>);
    if (!entity) {
      return null;
    }

    Object.assign(entity, data);
    return await this.repository.save(entity);
  };

  // Delete
  delete = async (id: string): Promise<DeleteResult> => {
    return await this.repository.delete(id);
  };

  // TO DTO
  async toDTO(entity: T, ...args: any[]): Promise<ReturnType<T['toDTO']>> {
    return entity.toDTO(...args);
  }
}
