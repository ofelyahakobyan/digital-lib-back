import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';
import Users from './users';

class Reviews extends Model {}

Reviews.init(
  {
    reviewId: {
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
    text: { type: DataTypes.TEXT },
    rating: { type: DataTypes.TINYINT.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'reviews',
    modelName: 'reviews',
  },
);

Reviews.belongsTo(Books, { foreignKey: 'bookId', onDelete: 'CASCADE' });
Books.hasMany(Reviews, { foreignKey: 'bookId', onDelete: 'CASCADE' });

Reviews.belongsTo(Users, { foreignKey: 'userId', onDelete: 'SET NULL' });
Users.hasMany(Reviews, { foreignKey: 'userId', onDelete: 'SET NULL' });
export default Reviews;
