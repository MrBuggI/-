import bcrypt from 'bcryptjs';
import { PASSWORD_SALT_ROUNDS } from '../config/index.js';

export async function hashPassword(password) {
  return bcrypt.hash(String(password), PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;

  return bcrypt.compare(String(password), passwordHash);
}
