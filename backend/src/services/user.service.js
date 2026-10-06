import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../errors.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { validateLogin, validateUser } from '../utils/validators.js';

export async function listUsers({ search, limit, offset } = {}) {
  const where = {};

  if (search) {
    const needle = `%${String(search).trim().toLowerCase()}%`;
    where[Op.or] = [{ name: { [Op.like]: needle } }, { email: { [Op.like]: needle } }];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    order: [['id', 'ASC']],
  });

  return { total: count, count: rows.length, items: rows };
}

export async function getUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError('User', id);

  return user;
}

export async function createUser(data = {}) {
  const errors = validateUser(data, { requirePassword: true });
  if (errors.length > 0) throw new ValidationError(errors);

  const email = String(data.email).trim().toLowerCase();
  await assertEmailIsFree(email);

  return User.create({
    name: data.name,
    email,
    passwordHash: await hashPassword(data.password),
    phone: data.phone ?? '',
    role: data.role ?? 'customer',
    address: data.address ?? '',
  });
}

export async function replaceUser(id, data = {}) {
  const user = await getUser(id);

  const errors = validateUser(data, { partial: false });
  if (errors.length > 0) throw new ValidationError(errors);

  const email = String(data.email).trim().toLowerCase();
  await assertEmailIsFree(email, user.id);

  await user.update({
    name: data.name,
    email,
    phone: data.phone ?? '',
    role: data.role ?? 'customer',
    address: data.address ?? '',

    ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
  });

  return user;
}

export async function updateUser(id, data = {}) {
  const user = await getUser(id);

  const errors = validateUser(data, { partial: true });
  if (errors.length > 0) throw new ValidationError(errors);

  const patch = {};

  if (data.name !== undefined) patch.name = data.name;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.role !== undefined) patch.role = data.role;
  if (data.address !== undefined) patch.address = data.address;
  if (data.password !== undefined) patch.passwordHash = await hashPassword(data.password);
  if (data.email !== undefined) {
    const email = String(data.email).trim().toLowerCase();
    await assertEmailIsFree(email, user.id);
    patch.email = email;
  }

  await user.update(patch);

  return user;
}

export async function deleteUser(id) {
  const user = await getUser(id);
  await user.destroy();

  return user;
}

export async function login(data = {}) {
  const errors = validateLogin(data);
  if (errors.length > 0) throw new ValidationError(errors);

  const user = await User.findOne({ where: { email: String(data.email).trim().toLowerCase() } });
  const passwordMatches = user ? await verifyPassword(data.password, user.passwordHash) : false;

  if (!user || !passwordMatches) throw new UnauthorizedError('Неверный e-mail или пароль');

  return user;
}

async function assertEmailIsFree(email, exceptId = null) {
  const where = { email };
  if (exceptId) where.id = { [Op.ne]: exceptId };

  const existing = await User.findOne({ where });
  if (existing) throw new ValidationError(['email: такой e-mail уже зарегистрирован']);
}
