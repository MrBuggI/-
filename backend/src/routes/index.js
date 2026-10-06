import { Router } from 'express';
import { usersRouter } from './users.routes.js';
import { productsRouter } from './products.routes.js';
import { ordersRouter } from './orders.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (req, res) => {
  res.json({
    entities: ['users', 'products', 'orders'],
    endpoints: {
      users: '/api/users',
      login: 'POST /api/users/login',
      products: '/api/products',
      orders: '/api/orders',
      userOrders: '/api/users/:id/orders',
    },
  });
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
