import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';
import Users from './users';

class UserBooks extends Model {}

UserBooks.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      reference: { model: Users, key: 'id' },
    },
    bookId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      reference: { model: Books, key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('wish', 'cart', 'paid', 'paymentPending'),
      allowNull: false,
      defaultValue: 'wish',
      unique: 'compositeIndex',
    },
  },
  {
    sequelize,
    tableName: 'user_books',
    modelName: 'user_books',
  },
);

Books.belongsToMany(Users, { through: { model: UserBooks, unique: false, as: 'users' } });
Users.belongsToMany(Books, { through: { model: UserBooks, unique: false, as: 'books' } });
export default UserBooks;
