import { ValidationError } from '../errors.js';

export function parseId(req, name = 'id') {
  const id = Number(req.params[name]);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError([`${name}: должен быть целым положительным числом`]);
  }

  return id;
}

export function parseNumber(value, field) {
  const number = Number(value);

  if (value === undefined || value === '' || Number.isNaN(number)) {
    throw new ValidationError([`${field}: должно быть числом`]);
  }

  return number;
}
