import { Model, DataTypes } from 'sequelize';

export class Product extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(150),
          allowNull: false,
          validate: { len: { args: [2, 150], msg: 'title: нужно минимум 2 символа' } },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'other',
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
          validate: { min: { args: [0], msg: 'price: должно быть не меньше 0' } },
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: { args: [0], msg: 'stock: должно быть не меньше 0' } },
        },
      },
      {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
      },
    );
  }

  get inStock() {
    return this.stock > 0;
  }
}
