export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends HttpError {
  constructor(details = []) {
    super(400, 'Ошибка валидации данных', details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Требуется авторизация') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Доступ запрещён') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(entity, id) {
    super(404, `Сущность "${entity}" с id=${id} не найдена`);
    this.entity = entity;
    this.id = id;
  }
}
