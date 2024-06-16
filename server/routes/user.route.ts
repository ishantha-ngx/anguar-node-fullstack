import { userController } from '@server/controllers';
import { asyncErrorHandler, auth } from '@server/middlewares';
import { Router } from 'express';

const router = Router();

router.route('/').get(asyncErrorHandler(userController.getAll));
router.route('/').post(asyncErrorHandler(userController.create));
router.route('/:id').get(asyncErrorHandler(userController.getById));
router.route('/:id').put(asyncErrorHandler(userController.update));
router.route('/:id').delete(asyncErrorHandler(userController.delete));

export default router;
