import 'module-alias/register';
import * as dotevnv from 'dotenv';
dotevnv.config();

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, handleLoging } from '@server/middlewares';
import { AppDataSource } from './config';
import router from '@server/routes';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

// Apply the API routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Initialiye Database
AppDataSource.initialize()
  .then(() => {
    return app.listen(PORT, async () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    handleLoging({
      type: 'DB_CONNECTION_ERROR',
      error,
    });
  });
