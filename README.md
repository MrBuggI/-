# Интернет-магазин

Учебный проект: REST API интернет-магазина и страница, которая показывает данные с этого API.

- `backend/` — сервер на Express 5 и Sequelize (SQLite): пользователи, товары, заказы
- `frontend/` — Vite-приложение, загружающее товары и пользователей с API

## Запуск

Бэкенд (первый терминал):

```bash
cd backend
npm install
npm start
```

Сервер поднимется на `http://localhost:3000`. При первом запуске создаются файл базы,
таблицы и демо-данные (2 пользователя, 3 товара). Карта API — `http://localhost:3000/api`.

Вход для проверки: **ivan@example.com / demo12345**

Фронтенд (второй терминал):

```bash
cd frontend
npm install
npm run dev
```

Страница откроется на `http://localhost:5173` — этот адрес уже добавлен в список
разрешённых источников бэкенда (`ALLOWED_ORIGINS`), поэтому запросы к API проходят.

## Стек

- Node.js, Express 5
- Sequelize 6 + SQLite (файл `backend/database.sqlite`)
- bcryptjs — хеширование паролей
- cors — доступ с фронтенда по списку разрешённых адресов
- Vite — сборка и dev-сервер фронтенда

## Настройки бэкенда

| Переменная | По умолчанию | Зачем |
|---|---|---|
| `PORT` | 3000 | порт сервера |
| `DB_STORAGE` | `./database.sqlite` | файл базы |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | источники, которым разрешены запросы к API |
| `PASSWORD_SALT_ROUNDS` | 10 | сложность хеширования пароля |

Если меняли модели, а база уже создана — удалите `backend/database.sqlite` и запустите сервер заново.

## Структура

```
backend/
├── package.json
└── src/
    ├── main.js           запуск: подключение к базе, создание таблиц, демо-данные, listen
    ├── app.js            сборка приложения: middleware, маршруты, обработка ошибок
    ├── config/           настройки (порт, база, origins, соль, лимиты)
    ├── constants.js      роли пользователей и статусы заказов
    ├── errors.js         классы ошибок (400, 401, 403, 404)
    ├── routes/           маршруты
    ├── controllers/      обработчики запросов
    ├── services/         логика: валидация, склад, суммы, хеширование
    ├── models/           таблицы Sequelize и связи
    ├── middlewares/      логгер, проверка Authorization, лимит запросов
    ├── db/               подключение к SQLite и демо-данные
    └── utils/            валидаторы, работа с паролями, разбор параметров

frontend/
├── package.json
├── index.html
└── src/
    ├── main.js           запросы к API и отрисовка списков
    └── style.css
```

Запрос на бэкенде идёт по слоям: `routes` → `controllers` → `services` → `models` → база.
Маршруты знают только про URL, контроллеры — про `req`/`res`, вся логика в сервисах.

## Эндпоинты

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/` | «Hello World!» |
| GET | `/api` | карта API |
| POST | `/api/users` | создать пользователя (`name`, `email`, `password`) |
| POST | `/api/users/login` | вход по e-mail и паролю |
| GET | `/api/users` | список (`?search=`, `?limit=`, `?offset=`) |
| GET | `/api/users/:id` | один пользователь |
| GET | `/api/users/:id/orders` | заказы пользователя |
| PUT | `/api/users/:id` | заменить целиком |
| PATCH | `/api/users/:id` | изменить переданные поля |
| DELETE | `/api/users/:id` | удалить |
| GET | `/api/products` | список (`?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?inStock=`) |
| GET | `/api/products/:id` | один товар |
| POST | `/api/products` | создать товар |
| PUT | `/api/products/:id` | заменить целиком |
| PATCH | `/api/products/:id` | изменить переданные поля |
| DELETE | `/api/products/:id` | удалить |
| GET | `/api/orders` | список (`?userId=`, `?status=`) |
| GET | `/api/orders/:id` | один заказ |
| POST | `/api/orders` | создать заказ |
| PUT | `/api/orders/:id` | заменить целиком |
| PATCH | `/api/orders/:id` | изменить переданные поля |
| PATCH | `/api/orders/:id/status` | сменить статус |
| DELETE | `/api/orders/:id` | удалить |
| GET | `/users/:id` | возвращает `{ "id": "<id из URL>" }` |
| GET | `/search?q=...` | возвращает `{ "q": "..." }`, без `q` — 400 |
| POST | `/echo` | возвращает присланное JSON-тело |
| GET | `/admin` | нужен заголовок `Authorization`, иначе 401 |
| GET | `/limited` | не больше 5 запросов за 10 секунд с одного IP |

Статусы заказа: `new`, `paid`, `shipped`, `completed`, `cancelled`.
Роли пользователя: `customer`, `admin`.

## Примеры запросов

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Пётр Сидоров","email":"petr@example.com","password":"Secret123"}'

curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@example.com","password":"demo12345"}'

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":1,"quantity":1},{"productId":2,"quantity":2}]}'
```

В заказе достаточно `productId` и `quantity`: название и цену backend возьмёт из каталога,
проверит остаток на складе и сохранит их как «снимок» на момент оформления.

## Ошибки

```json
{ "error": { "message": "Ошибка валидации данных", "details": ["price: должно быть не меньше 0"] } }
```

| Код | Когда |
|---|---|
| 400 | данные не прошли валидацию, `:id` не число, битый JSON, повторный e-mail |
| 401 | неверный e-mail или пароль, `/admin` без заголовка `Authorization` |
| 403 | источник не входит в `ALLOWED_ORIGINS` |
| 404 | записи с таким `id` нет или маршрут не найден |
| 429 | превышен лимит запросов |
| 500 | непредвиденная ошибка сервера |
