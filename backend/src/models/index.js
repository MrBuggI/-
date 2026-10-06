import { sequelize } from '../db/sequelize.js';
import { User } from './User.js';
import { Product } from './Product.js';
import { Order } from './Order.js';

User.init(sequelize);
Product.init(sequelize);
Order.init(sequelize);

User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Product, Order };
