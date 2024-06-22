import { userController } from '@server/controllers';
import { asyncErrorHandler } from '@server/middlewares';
import {
  refreshTokenValidation,
  userLoginValidation,
  userRegistrationValidation,
} from '@server/validation';
import { Router } from 'express';

const router = Router();

// Auth
router
  .route('/login')
  .post(userLoginValidation, asyncErrorHandler(userController.login));
router
  .route('/register')
  .post(userRegistrationValidation, asyncErrorHandler(userController.register));
router
  .route('/refresh')
  .get(refreshTokenValidation, asyncErrorHandler(userController.refreshToken));
router
  .route('/confirm-email/:token')
  .get(asyncErrorHandler(userController.confirmEmailAddress));

export default router;
