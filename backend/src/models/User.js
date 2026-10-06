import { Model, DataTypes } from 'sequelize';
import { USER_ROLES } from '../constants.js';

export class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: { len: { args: [2, 100], msg: 'name: нужно минимум 2 символа' } },
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
          validate: { isEmail: { msg: 'email: некорректный e-mail' } },

          set(value) {
            this.setDataValue('email', String(value ?? '').trim().toLowerCase());
          },
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(30),
          allowNull: false,
          defaultValue: '',
        },
        role: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'customer',
          validate: { isIn: { args: [USER_ROLES], msg: `role: допустимые значения — ${USER_ROLES.join(', ')}` } },
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: '',
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
      },
    );
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;

    return values;
  }
}
