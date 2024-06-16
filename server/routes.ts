import { Router, Application } from 'express';
import { asyncErrorHandler, auth } from '@server/middlewares';
import { userController } from '@server/controllers';
import { UrlNotFoundError } from '@server/errors';
import { userLoginValidation, userRegistrationValidation } from './validation';

const setRoutes = (app: Application): void => {
  const router = Router();

  // Auth
  router
    .route('/auth/login')
    .post(userLoginValidation, asyncErrorHandler(userController.login));
  router
    .route('/auth/register')
    .post(
      userRegistrationValidation,
      asyncErrorHandler(userController.register)
    );
  router
    .route('/auth/refresh')
    .post(asyncErrorHandler(userController.refreshToken));

  // Users Routes
  router.route('/users').get(auth, asyncErrorHandler(userController.getAll));
  router.route('/user').post(asyncErrorHandler(userController.create));
  router.route('/user/:id').get(asyncErrorHandler(userController.getById));
  router.route('/user/:id').put(asyncErrorHandler(userController.update));
  router.route('/user/:id').delete(asyncErrorHandler(userController.delete));

  // Handle invalid URLs
  router.all('/*', () => {
    throw new UrlNotFoundError();
  });

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
