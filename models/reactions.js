import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './users';
import Reviews from './reviews';

class Reactions extends Model {}

Reactions.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    reviewId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: 'compositeIndex',
    },
    userId: { type: DataTypes.BIGINT.UNSIGNED, unique: 'compositeIndex' },
    activityType: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false,
      defaultValue: 'like',
    },
  },
  {
    sequelize,
    tableName: 'reactions',
    modelName: 'reactions',
  },
);

Reactions.belongsTo(Users, { foreignKey: 'userId', onDelete: 'SET NULL' });
Users.hasMany(Reactions, { foreignKey: 'userId', onDelete: 'SET NULL' });
Reactions.belongsTo(Reviews, { foreignKey: 'reviewId', onDelete: 'CASCADE' });
Reviews.hasMany(Reactions, { foreignKey: 'reviewId', onDelete: 'CASCADE' });

export default Reactions;
