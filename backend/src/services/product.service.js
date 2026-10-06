import { Op } from 'sequelize';
import { Product } from '../models/index.js';
import { NotFoundError, ValidationError } from '../errors.js';
import { parseNumber } from '../utils/http.js';
import { validateProduct } from '../utils/validators.js';

export async function listProducts({ search, category, minPrice, maxPrice, inStock } = {}) {
  const where = {};

  if (search) {
    const needle = `%${String(search).trim().toLowerCase()}%`;
    where[Op.or] = [{ title: { [Op.like]: needle } }, { description: { [Op.like]: needle } }];
  }

  if (category) where.category = String(category);

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price[Op.gte] = parseNumber(minPrice, 'minPrice');
    if (maxPrice !== undefined) where.price[Op.lte] = parseNumber(maxPrice, 'maxPrice');
  }

  if (inStock !== undefined) {
    where.stock = String(inStock) === 'true' ? { [Op.gt]: 0 } : { [Op.eq]: 0 };
  }

  const items = await Product.findAll({ where, order: [['id', 'ASC']] });

  return { total: items.length, items };
}

export async function getProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) throw new NotFoundError('Product', id);

  return product;
}

export async function createProduct(data = {}) {
  const errors = validateProduct(data, { partial: false });
  if (errors.length > 0) throw new ValidationError(errors);

  return Product.create({
    title: data.title,
    description: data.description ?? '',
    category: data.category ?? 'other',
    price: data.price,
    stock: data.stock ?? 0,
  });
}

export async function replaceProduct(id, data = {}) {
  const product = await getProduct(id);

  const errors = validateProduct(data, { partial: false });
  if (errors.length > 0) throw new ValidationError(errors);

  await product.update({
    title: data.title,
    description: data.description ?? '',
    category: data.category ?? 'other',
    price: data.price,
    stock: data.stock ?? 0,
  });

  return product;
}

export async function updateProduct(id, data = {}) {
  const product = await getProduct(id);

  const errors = validateProduct(data, { partial: true });
  if (errors.length > 0) throw new ValidationError(errors);

  const patch = {};
  for (const field of ['title', 'description', 'category', 'price', 'stock']) {
    if (data[field] !== undefined) patch[field] = data[field];
  }

  await product.update(patch);

  return product;
}

export async function deleteProduct(id) {
  const product = await getProduct(id);
  await product.destroy();

  return product;
}
