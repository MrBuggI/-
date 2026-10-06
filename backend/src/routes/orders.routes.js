import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';

export const ordersRouter = Router();

ordersRouter.get('/', orderController.list);
ordersRouter.post('/', orderController.create);
ordersRouter.get('/:id', orderController.getOne);
ordersRouter.patch('/:id/status', orderController.updateStatus);
ordersRouter.put('/:id', orderController.replace);
ordersRouter.patch('/:id', orderController.update);
ordersRouter.delete('/:id', orderController.remove);
