import { AppDataSource } from '@server/config';
import { AppBaseEntity } from '@server/entities/_AppBaseEntity';
import messages from '@server/messages';
import { BaseService } from '@server/service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FindOneOptions, ObjectType } from 'typeorm';

export abstract class BaseController<T extends AppBaseEntity> {
  protected service: BaseService<T>;
  protected responseType?: any;

  constructor(entityClass: ObjectType<T>, responseType?: any) {
    this.service = new BaseService<T>(AppDataSource.getRepository(entityClass));
    this.responseType = responseType;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const entities = await this.service.findAll();
    const dtos = await Promise.all(
      entities.map((entity: T) => this.service.toDTO(entity))
    );
    res.status(StatusCodes.OK).json(dtos);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const entity = await this.service.findById(req.params.id);
    if (!entity) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: messages.error.notFound });
      return;
    }
    const dto = await this.service.toDTO(entity, true);
    res.status(StatusCodes.OK).json(dto);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const createdEntity = await this.service.create(req.body);
    const dto = await this.service.toDTO(createdEntity);
    res.status(StatusCodes.CREATED).json(dto);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const updatedEntity = await this.service.update(
      { id: req.params.id } as FindOneOptions<T>,
      req.body
    );
    if (!updatedEntity) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: messages.error.notFound });
      return;
    }
    const dto = await this.service.toDTO(updatedEntity);
    res.status(StatusCodes.OK).json(dto);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.delete(req.params.id);
    if (!result) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: messages.error.notFound });
      return;
    }
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
