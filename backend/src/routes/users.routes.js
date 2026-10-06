import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as orderController from '../controllers/order.controller.js';

export const usersRouter = Router();

usersRouter.get('/', userController.list);
usersRouter.post('/', userController.create);

usersRouter.post('/login', userController.login);

usersRouter.get('/:id', userController.getOne);
usersRouter.get('/:id/orders', orderController.listByUser);
usersRouter.put('/:id', userController.replace);
usersRouter.patch('/:id', userController.update);
usersRouter.delete('/:id', userController.remove);
