import { Sequelize } from 'sequelize';
import { DB_STORAGE } from '../config/index.js';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_STORAGE,
  logging: false,
});

export async function connectDatabase() {
  await sequelize.authenticate();
  await sequelize.query('PRAGMA foreign_keys = ON;');

  return sequelize;
}
