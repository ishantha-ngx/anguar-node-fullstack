import 'reflect-metadata';
import {
  Auth,
  EmailConfirmation,
  Permission,
  Role,
  User,
} from '@server/entities';
import { DataSource } from 'typeorm';

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

const port = DB_PORT as number | undefined;
const entities = [Auth, EmailConfirmation, Permission, Role, User];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: port,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: entities,
  migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
});
