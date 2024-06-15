import { AppDataSource } from '@server/config';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseModel<T> {
  getAll(): Promise<Array<T>>;
  count(): Promise<number>;
  getById(id: string): Promise<T>;
  insert(body: DeepPartial<T>): Promise<T>;
  update(id: string, body: QueryDeepPartialEntity<T>): Promise<UpdateResult>;
  delete(id: string): Promise<DeleteResult>;
}

export abstract class BaseModel<T> implements IBaseModel<T> {
  private model: T;
  public repository: Repository<any>;

  constructor(model: T) {
    this.model = model;
    this.repository = AppDataSource.getRepository(this.model as any);
  }

  // Get all
  getAll = async () => {
    return await this.repository.find({});
  };

  // Count all
  count = async () => {
    return await this.repository.count();
  };

  // Get by id
  getById = async (id: string) => {
    return await this.repository.findOneBy({ id });
  };

  // Insert
  insert = async (body: DeepPartial<T>) => {
    return await this.repository.save(body);
  };

  // Update by id
  update = async (id: string, body: QueryDeepPartialEntity<T>) => {
    return await this.repository.update({ id }, body);
  };

  // Delete by id
  delete = async (id: string) => {
    return await this.repository.delete({ id });
  };
}
