const API = 'http://localhost:3000/api';

const statusBox = document.querySelector('#status');
const productsList = document.querySelector('#products');
const usersList = document.querySelector('#users');

async function load(path) {
  const response = await fetch(API + path);

  if (!response.ok) throw new Error(`${path} вернул ${response.status}`);

  return response.json();
}

function render(element, items, formatItem) {
  element.innerHTML = items.map((item) => `<li>${formatItem(item)}</li>`).join('');
}

async function main() {
  try {
    const [products, users] = await Promise.all([load('/products'), load('/users')]);

    render(productsList, products.items, (product) => `${product.title} — ${product.price} ₽ (остаток: ${product.stock})`);
    render(usersList, users.items, (user) => `${user.name} — ${user.email}`);

    statusBox.textContent = `Загружено товаров: ${products.total}, пользователей: ${users.total}`;
  } catch (error) {
    statusBox.textContent = `Не удалось загрузить данные: ${error.message}. Проверьте, что бэкенд запущен на порту 3000.`;
  }
}

main();
