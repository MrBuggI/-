import { Model, DataTypes } from 'sequelize';
import { ORDER_STATUSES } from '../constants.js';

export class Order extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        items: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'new',
          validate: { isIn: { args: [ORDER_STATUSES], msg: `status: допустимые значения — ${ORDER_STATUSES.join(', ')}` } },
        },
        deliveryAddress: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: '',
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: '',
        },
      },
      {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
      },
    );
  }

  get total() {
    const sum = (this.items ?? []).reduce((acc, item) => acc + item.price * item.quantity, 0);

    return Number(sum.toFixed(2));
  }

  toJSON() {
    return { ...this.get(), total: this.total };
  }
}
