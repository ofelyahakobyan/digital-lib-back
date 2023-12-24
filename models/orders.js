import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from "./books.js";
import Users from "./users.js";
import UserBooks from "./userBooks.js";

export default class Orders extends Model {
}

Orders.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'canceled', 'confirmed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    transaction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'orders',
  },
);

Books.belongsToMany(Users, { through: { model: Orders, unique: false, as: 'users' } });
Users.belongsToMany(Books, { through: { model: Orders, unique: false, as: 'books' } });
