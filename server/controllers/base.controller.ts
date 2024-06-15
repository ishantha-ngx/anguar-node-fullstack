import { IBaseModel } from '@server/models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

abstract class BaseController<T> {
  model: T & IBaseModel<T>;
  parseDTO: any;

  constructor({ model, dto }: { model: any; dto?: any }) {
    this.model = new model() as T & IBaseModel<T>;
    this.parseDTO = (obj: any) => {
      return dto ? new dto(obj) : obj;
    };
  }

  // Get all
  getAll = async (req: Request, res: Response) => {
    let allRecords = await this.model.getAll();
    allRecords = allRecords.map((record: any) => this.parseDTO(record));
    return res.status(StatusCodes.OK).json(allRecords);
  };

  // Count all
  count = async (req: Request, res: Response) => {
    let count = await this.model.count();
    return res.status(StatusCodes.OK).json(count);
  };

  // Get by id
  get = async (req: Request, res: Response) => {
    const record = await this.model.getById(req.params.id);
    return res.status(StatusCodes.OK).json(this.parseDTO(record));
  };

  // Insert
  insert = async (req: Request, res: Response) => {
    const obj = await this.model.insert(req.body);
    return res.status(StatusCodes.CREATED).json(this.parseDTO(obj));
  };

  // Update by id
  update = async (req: Request, res: Response) => {
    const obj = await this.model.update(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(this.parseDTO(obj));
  };

  // Delete by id
  delete = async (req: Request, res: Response) => {
    const obj = await this.model.delete(req.params.id);
    console.log(obj);
    return res.status(200).json(this.parseDTO(obj));
  };
}

export default BaseController;
