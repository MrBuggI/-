import express from 'express';
import cors from 'cors';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { ALLOWED_ORIGINS } from './config/index.js';
import { ForbiddenError, HttpError } from './errors.js';
import { requestLogger } from './middlewares/logger.js';
import { demoRouter } from './routes/demo.routes.js';
import { usersRouter } from './routes/users.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(requestLogger);

  app.use(
    cors({
      origin(origin, callback) {

        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);

        callback(new ForbiddenError(`Источник ${origin} не разрешён (CORS)`));
      },
      credentials: true,
    }),
  );

  app.use(express.json());

  app.use(demoRouter);
  app.use('/users', usersRouter);
  app.use('/api', apiRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: { message: `Маршрут ${req.method} ${req.originalUrl} не найден` },
    });
  });

  app.use((err, req, res, _next) => {

    if (err instanceof HttpError) {
      return res.status(err.status).json({
        error: { message: err.message, details: err.details },
      });
    }

    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({
        error: {
          message: 'Ошибка валидации данных',
          details: err.errors.map((item) => `${item.path}: такое значение уже занято`),
        },
      });
    }

    if (err instanceof SequelizeValidationError) {
      return res.status(400).json({
        error: {
          message: 'Ошибка валидации данных',
          details: err.errors.map((item) => item.message),
        },
      });
    }

    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: { message: 'Некорректный JSON в теле запроса' } });
    }

    console.error(err);
    res.status(500).json({ error: { message: 'Внутренняя ошибка сервера' } });
  });

  return app;
}
