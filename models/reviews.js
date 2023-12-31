import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';
import Users from './users';

class Reviews extends Model {}

Reviews.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: 'compositeIndex',
    },
    userId: { type: DataTypes.BIGINT.UNSIGNED, unique: 'compositeIndex' },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
    rating: { type: DataTypes.TINYINT.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'reviews',
    modelName: 'reviews',
  },
);

Reviews.belongsTo(Books, { foreignKey: 'bookId', onDelete: 'CASCADE', as: 'book' });
Books.hasMany(Reviews, { foreignKey: 'bookId', onDelete: 'CASCADE', as: 'reviews' });

Reviews.belongsTo(Users, { foreignKey: 'userId', onDelete: 'SET NULL', as: 'user' });
Users.hasMany(Reviews, { foreignKey: 'userId', onDelete: 'SET NULL', as: 'reviews' });
export default Reviews;
