export const PORT = Number(process.env.PORT ?? 3000);

export const DB_STORAGE = process.env.DB_STORAGE ?? './database.sqlite';

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? 10);

export const RATE_LIMIT = {
  windowMs: 10_000,
  max: 5,
};
