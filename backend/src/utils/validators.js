import { ORDER_STATUSES, USER_ROLES } from '../constants.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function isEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

export function isStrongPassword(value) {
  return validatePassword(value).length === 0;
}

export function validateEmail(value, field = 'email') {
  const email = String(value ?? '').trim();

  if (email === '') return [`${field}: поле обязательно`];
  if (!isEmail(email)) return [`${field}: некорректный e-mail, пример user@example.com`];

  return [];
}

export function validatePassword(value, field = 'password') {
  const errors = [];

  if (value === undefined || value === null || String(value) === '') {
    return [`${field}: поле обязательно`];
  }

  const password = String(value);

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`${field}: минимум ${MIN_PASSWORD_LENGTH} символов`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`${field}: максимум ${MAX_PASSWORD_LENGTH} символа`);
  }
  if (!/[A-Za-zА-Яа-я]/.test(password)) {
    errors.push(`${field}: нужна хотя бы одна буква`);
  }
  if (!/\d/.test(password)) {
    errors.push(`${field}: нужна хотя бы одна цифра`);
  }

  return errors;
}

export function validateString(value, field, { required = true, min = 1, max = 255 } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return required ? [`${field}: поле обязательно`] : [];
  }

  const length = String(value).trim().length;
  const errors = [];

  if (length < min) errors.push(`${field}: минимум ${min} символа`);
  if (length > max) errors.push(`${field}: максимум ${max} символов`);

  return errors;
}

export function validateId(value, field = 'id') {
  const number = Number(value);

  if (value === undefined || value === null || value === '') return [`${field}: поле обязательно`];
  if (!Number.isInteger(number) || number <= 0) return [`${field}: должно быть целым положительным числом`];

  return [];
}

export function validateNumber(value, field, { required = true, integer = false, min = -Infinity, max = Infinity } = {}) {
  if (value === undefined || value === null || value === '') {
    return required ? [`${field}: поле обязательно`] : [];
  }

  const number = Number(value);
  const errors = [];

  if (Number.isNaN(number)) errors.push(`${field}: должно быть числом`);
  else {
    if (integer && !Number.isInteger(number)) errors.push(`${field}: должно быть целым числом`);
    if (number < min) errors.push(`${field}: должно быть не меньше ${min}`);
    if (number > max) errors.push(`${field}: должно быть не больше ${max}`);
  }

  return errors;
}

export function validateEnum(value, allowed, field) {
  if (value === undefined || value === null) return [];
  if (!allowed.includes(value)) return [`${field}: допустимые значения — ${allowed.join(', ')}`];

  return [];
}

export function validateArray(value, field) {
  if (!Array.isArray(value)) return [`${field}: должен быть массивом`];
  if (value.length === 0) return [`${field}: нужен непустой массив`];

  return [];
}

export function validateUser(data = {}, { partial = false, requirePassword = false } = {}) {
  const errors = [];
  const has = (field) => data[field] !== undefined;

  if (!partial || has('name')) {
    errors.push(...validateString(data.name, 'name', { required: !partial, min: 2, max: 100 }));
  }
  if (!partial || has('email')) {
    errors.push(...validateEmail(data.email));
  }
  if (requirePassword || has('password')) {
    errors.push(...validatePassword(data.password));
  }
  if (has('role')) {
    errors.push(...validateEnum(data.role, USER_ROLES, 'role'));
  }
  if (has('phone')) {
    errors.push(...validateString(data.phone, 'phone', { required: false, max: 30 }));
  }
  if (has('address')) {
    errors.push(...validateString(data.address, 'address', { required: false, max: 255 }));
  }

  return errors;
}

export function validateProduct(data = {}, { partial = false } = {}) {
  const errors = [];
  const has = (field) => data[field] !== undefined;

  if (!partial || has('title')) {
    errors.push(...validateString(data.title, 'title', { required: !partial, min: 2, max: 150 }));
  }
  if (!partial || has('price')) {
    errors.push(...validateNumber(data.price, 'price', { required: !partial, min: 0, max: 10_000_000 }));
  }
  if (has('stock')) {
    errors.push(...validateNumber(data.stock, 'stock', { required: false, integer: true, min: 0, max: 1_000_000 }));
  }
  if (has('category')) {
    errors.push(...validateString(data.category, 'category', { required: false, max: 50 }));
  }
  if (has('description')) {
    errors.push(...validateString(data.description, 'description', { required: false, max: 1000 }));
  }

  return errors;
}

export function validateOrderItems(items) {
  const errors = validateArray(items, 'items');
  if (errors.length > 0) return errors;

  items.forEach((item, index) => {
    errors.push(...validateId(item?.productId, `items[${index}].productId`));

    if (item?.quantity !== undefined) {
      errors.push(...validateNumber(item.quantity, `items[${index}].quantity`, { integer: true, min: 1 }));
    }
  });

  return errors;
}

export function validateOrder(data = {}, { partial = false } = {}) {
  const errors = [];
  const has = (field) => data[field] !== undefined;

  if (!partial || has('userId')) {
    errors.push(...validateId(data.userId, 'userId'));
  }
  if (!partial || has('items')) {
    errors.push(...validateOrderItems(data.items));
  }
  if (has('status')) {
    errors.push(...validateEnum(data.status, ORDER_STATUSES, 'status'));
  }
  if (has('deliveryAddress')) {
    errors.push(...validateString(data.deliveryAddress, 'deliveryAddress', { required: false, max: 255 }));
  }
  if (has('comment')) {
    errors.push(...validateString(data.comment, 'comment', { required: false, max: 500 }));
  }

  return errors;
}

export function validateLogin(data = {}) {
  const errors = [...validateEmail(data.email)];

  if (data.password === undefined || String(data.password) === '') {
    errors.push('password: поле обязательно');
  }

  return errors;
}
