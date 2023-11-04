import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './users';
import Books from './books';

class Downloads extends Model {}

Downloads.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: { type: DataTypes.BIGINT.UNSIGNED },
    userId: { type: DataTypes.BIGINT.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'downloads',
    modelName: 'downloads',
  },
);

Downloads.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
Users.hasMany(Downloads, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE', as: 'downloads' });

Downloads.belongsTo(Books, { foreignKey: 'bookId', as: 'book' });
Books.hasMany(Downloads, { foreignKey: 'userId', onDelete: 'SET NULL', onUpdate: 'CASCADE', as: 'downloads' });

export default Downloads;
