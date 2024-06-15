import { IUserModel, UserModel } from '@server/models';
import BaseController from './base.controller';

class TemplateController extends BaseController<IUserModel> {
  constructor() {
    super({
      model: UserModel,
    });
  }
}

export default TemplateController;
