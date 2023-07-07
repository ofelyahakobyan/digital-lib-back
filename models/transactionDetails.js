import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Transactions from './transactions';
import Books from './books';

class TransactionDetails extends Model {}

TransactionDetails.init(
  {
    transactionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      reference: { model: Transactions, key: 'id' },
    },
    bookId: {
      type: DataTypes.BIGINT.UNSIGNED,
      reference: { model: Books, key: 'id' },
    },
    bookQty: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    subTotalPrice: { type: DataTypes.DOUBLE(12, 4) },
  },

  {
    sequelize,
    tableName: 'transaction_details',
    modelName: 'transaction_details',
  },
);

Transactions.belongsToMany(Books, { through: TransactionDetails });
Books.belongsToMany(Transactions, { through: TransactionDetails });
export default TransactionDetails;
