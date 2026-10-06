import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/', (req, res) => {
  res.json({
    message: 'Учебный маршрут. Пример: GET /users/42 -> { "id": "42" }',
    fullApi: '/api/users',
  });
});

usersRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});
