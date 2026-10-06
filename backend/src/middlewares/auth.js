export function requireAuthorization(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      error: { message: 'Доступ запрещён: нужен заголовок Authorization' },
    });
  }

  next();
}
