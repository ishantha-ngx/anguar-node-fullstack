import * as dotevnv from 'dotenv';
import morgan from 'morgan';
dotevnv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, handleLoging } from './middlewares';
import setRoutes from './routes';
import { AppDataSource } from './config';

AppDataSource.initialize()
  .then(() => {
    const { PORT = 3000 } = process.env;

    const app = express();

    app.use(express.json());
    app.use(morgan('dev'));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(cors());
    app.use(helmet());

    // Set app routes
    setRoutes(app);

    // Error handling
    app.use(errorHandler);

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
