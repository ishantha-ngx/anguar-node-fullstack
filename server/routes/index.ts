import { Router } from 'express';

import authRoutes from './auth.route';
import userRoutes from './user.route';
import { UrlNotFoundError } from '@server/errors';

const router = Router();

// Define routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Handle invalid URLs
router.all('/*', () => {
  throw new UrlNotFoundError();
});

export default router;
