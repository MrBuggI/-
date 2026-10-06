import * as orderService from '../services/order.service.js';
import { parseId } from '../utils/http.js';

export async function list(req, res) {
  const { userId, status } = req.query;

  res.json(await orderService.listOrders({ userId, status }));
}

export async function listByUser(req, res) {
  res.json(await orderService.listOrdersByUser(parseId(req)));
}

export async function getOne(req, res) {
  res.json(await orderService.getOrder(parseId(req)));
}

export async function create(req, res) {
  res.status(201).json(await orderService.createOrder(req.body));
}

export async function replace(req, res) {
  res.json(await orderService.replaceOrder(parseId(req), req.body));
}

export async function update(req, res) {
  res.json(await orderService.updateOrder(parseId(req), req.body));
}

export async function updateStatus(req, res) {
  res.json(await orderService.updateOrderStatus(parseId(req), req.body.status));
}

export async function remove(req, res) {
  res.json({ deleted: await orderService.deleteOrder(parseId(req)) });
}
