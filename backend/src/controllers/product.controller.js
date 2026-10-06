import * as productService from '../services/product.service.js';
import { parseId } from '../utils/http.js';

export async function list(req, res) {
  const { search, category, minPrice, maxPrice, inStock } = req.query;

  res.json(await productService.listProducts({ search, category, minPrice, maxPrice, inStock }));
}

export async function getOne(req, res) {
  res.json(await productService.getProduct(parseId(req)));
}

export async function create(req, res) {
  res.status(201).json(await productService.createProduct(req.body));
}

export async function replace(req, res) {
  res.json(await productService.replaceProduct(parseId(req), req.body));
}

export async function update(req, res) {
  res.json(await productService.updateProduct(parseId(req), req.body));
}

export async function remove(req, res) {
  res.json({ deleted: await productService.deleteProduct(parseId(req)) });
}
