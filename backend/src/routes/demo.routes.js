import { Router } from 'express';
import { ValidationError } from '../errors.js';
import { requireAuthorization } from '../middlewares/auth.js';
import { rateLimit } from '../middlewares/rateLimit.js';

export const demoRouter = Router();

demoRouter.get('/', (req, res) => {
  res.send('Hello World!');
});

demoRouter.get('/search', (req, res) => {
  const q = req.query.q;

  if (q === undefined || String(q).trim() === '') {
    throw new ValidationError(['q: параметр обязателен, например /search?q=ноутбук']);
  }

  res.json({ q });
});

demoRouter.post('/echo', (req, res) => {
  res.json(req.body);
});

demoRouter.get('/admin', requireAuthorization, (req, res) => {
  res.json({ message: 'Доступ разрешён: вы в админ-панели' });
});

demoRouter.get('/limited', rateLimit(), (req, res) => {
  res.json({ message: 'Запрос принят', rateLimit: req.rateLimit });
});
