import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';

export const productsRouter = Router();

productsRouter.get('/', productController.list);
productsRouter.post('/', productController.create);
productsRouter.get('/:id', productController.getOne);
productsRouter.put('/:id', productController.replace);
productsRouter.patch('/:id', productController.update);
productsRouter.delete('/:id', productController.remove);
