import { createApp } from './app.js';
import { PORT } from './config/index.js';
import { connectDatabase, sequelize } from './db/sequelize.js';
import { seed } from './db/seed.js';
import './models/index.js';

await connectDatabase();
await sequelize.sync();
await seed();

createApp().listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
  console.log('Учебные маршруты: /users/:id, /search?q=..., /echo, /admin, /limited');
  console.log(`API: http://localhost:${PORT}/api  (users, products, orders)`);
  console.log('База: SQLite, файл database.sqlite');
});
