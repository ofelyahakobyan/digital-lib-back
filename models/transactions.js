import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';
import Users from './users';
import CreditCards from './creditCards';

class Transactions extends Model {}

Transactions.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      reference: { model: Users, key: 'id' },
    },
    cardId: {
      type: DataTypes.BIGINT.UNSIGNED,
      reference: { model: CreditCards, key: 'id' },
    },
    totalPrice: { type: DataTypes.DOUBLE(12, 4) },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'canceled', 'commit'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },

  {
    sequelize,
    tableName: 'transactions',
    modelName: 'transactions',
  },
);

Books.belongsToMany(Users, { through: { model: Transactions, unique: false } });
Users.belongsToMany(Books, { through: { model: Transactions, unique: false } });

export default Transactions;
