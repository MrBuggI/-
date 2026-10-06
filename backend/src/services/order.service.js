import { Op } from 'sequelize';
import { Order, Product, User } from '../models/index.js';
import { NotFoundError, ValidationError } from '../errors.js';
import { ORDER_STATUSES } from '../constants.js';
import { parseNumber } from '../utils/http.js';
import { validateEnum, validateOrder, validateOrderItems } from '../utils/validators.js';

export async function listOrders({ userId, status } = {}) {
  const where = {};

  if (userId !== undefined) where.userId = parseNumber(userId, 'userId');
  if (status !== undefined) where.status = String(status);

  const items = await Order.findAll({ where, order: [['id', 'ASC']] });

  return { total: items.length, items };
}

export async function listOrdersByUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User', userId);

  const items = await Order.findAll({ where: { userId: user.id }, order: [['id', 'ASC']] });

  return { userId: user.id, total: items.length, items };
}

export async function getOrder(id) {
  const order = await Order.findByPk(id);
  if (!order) throw new NotFoundError('Order', id);

  return order;
}

export async function createOrder(data = {}) {
  const errors = validateOrder(data, { partial: false });
  if (errors.length > 0) throw new ValidationError(errors);

  const user = await findUserOrFail(Number(data.userId));
  const items = await buildItems(data.items);

  return Order.create({
    userId: user.id,
    items,
    status: data.status ?? 'new',
    deliveryAddress: data.deliveryAddress ?? user.address,
    comment: data.comment ?? '',
  });
}

export async function replaceOrder(id, data = {}) {
  const order = await getOrder(id);

  const errors = validateOrder(data, { partial: false });
  if (errors.length > 0) throw new ValidationError(errors);

  const user = await findUserOrFail(Number(data.userId));

  await order.update({
    userId: user.id,
    items: await buildItems(data.items),
    status: data.status ?? 'new',
    deliveryAddress: data.deliveryAddress ?? user.address,
    comment: data.comment ?? '',
  });

  return order;
}

export async function updateOrder(id, data = {}) {
  const order = await getOrder(id);

  const errors = validateOrder(data, { partial: true });
  if (errors.length > 0) throw new ValidationError(errors);

  const patch = {};

  if (data.userId !== undefined) patch.userId = (await findUserOrFail(Number(data.userId))).id;
  if (data.items !== undefined) patch.items = await buildItems(data.items);
  if (data.status !== undefined) patch.status = data.status;
  if (data.deliveryAddress !== undefined) patch.deliveryAddress = data.deliveryAddress;
  if (data.comment !== undefined) patch.comment = data.comment;

  await order.update(patch);

  return order;
}

export async function updateOrderStatus(id, status) {
  if (status === undefined) throw new ValidationError(['status: поле обязательно']);

  const errors = validateEnum(status, ORDER_STATUSES, 'status');
  if (errors.length > 0) throw new ValidationError(errors);

  const order = await getOrder(id);
  await order.update({ status });

  return order;
}

export async function deleteOrder(id) {
  const order = await getOrder(id);
  await order.destroy();

  return order;
}

async function findUserOrFail(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ValidationError([`userId: пользователь с id=${userId} не найден`]);

  return user;
}

async function buildItems(rawItems) {
  const errors = validateOrderItems(rawItems);
  if (errors.length > 0) throw new ValidationError(errors);

  const ids = [...new Set(rawItems.map((item) => Number(item.productId)))];
  const products = await Product.findAll({ where: { id: { [Op.in]: ids } } });
  const productsById = new Map(products.map((product) => [product.id, product]));

  return rawItems.map((raw, index) => {
    const product = productsById.get(Number(raw.productId));
    if (!product) {
      throw new ValidationError([`items[${index}].productId: товар с id=${raw.productId} не найден`]);
    }

    const quantity = raw.quantity === undefined ? 1 : Number(raw.quantity);
    if (product.stock < quantity) {
      throw new ValidationError([`items[${index}]: товара "${product.title}" на складе только ${product.stock} шт.`]);
    }

    return { productId: product.id, title: product.title, price: product.price, quantity };
  });
}
