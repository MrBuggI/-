import { Product, User } from '../models/index.js';
import { createProduct } from '../services/product.service.js';
import { createUser } from '../services/user.service.js';

export async function seed() {
  const [userCount, productCount] = await Promise.all([User.count(), Product.count()]);

  if (userCount > 0 || productCount > 0) return;

  const ivan = await createUser({
    name: 'Иван Петров',
    email: 'ivan@example.com',
    password: 'demo12345',
    phone: '+7 900 000-00-01',
    address: 'Москва, ул. Ленина, 1',
  });

  await createUser({
    name: 'Администратор',
    email: 'admin@example.com',
    password: 'admin12345',
    role: 'admin',
  });

  await createProduct({
    title: 'Ноутбук Lenovo IdeaPad',
    description: '15.6", 16 ГБ RAM, 512 ГБ SSD',
    category: 'laptops',
    price: 54990,
    stock: 7,
  });

  await createProduct({
    title: 'Мышь Logitech M185',
    description: 'Беспроводная, USB-приёмник',
    category: 'accessories',
    price: 1290,
    stock: 40,
  });

  await createProduct({
    title: 'Монитор Dell P2422H',
    description: '23.8", IPS, Full HD',
    category: 'monitors',
    price: 18990,
    stock: 0,
  });

  console.log(`Демо-данные загружены: пользователей — ${await User.count()}, товаров — ${await Product.count()}`);
  console.log(`Вход для проверки: ivan@example.com / demo12345 (id ${ivan.id})`);
}
