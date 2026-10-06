import * as userService from '../services/user.service.js';
import { parseId } from '../utils/http.js';

export async function list(req, res) {
  const { search, limit, offset } = req.query;

  res.json(await userService.listUsers({ search, limit, offset }));
}

export async function getOne(req, res) {
  res.json(await userService.getUser(parseId(req)));
}

export async function create(req, res) {
  res.status(201).json(await userService.createUser(req.body));
}

export async function replace(req, res) {
  res.json(await userService.replaceUser(parseId(req), req.body));
}

export async function update(req, res) {
  res.json(await userService.updateUser(parseId(req), req.body));
}

export async function remove(req, res) {
  res.json({ deleted: await userService.deleteUser(parseId(req)) });
}

export async function login(req, res) {
  res.json(await userService.login(req.body));
}
