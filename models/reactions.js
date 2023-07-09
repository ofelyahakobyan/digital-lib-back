import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './users';
import Reviews from './reviews';

class Reactions extends Model {}

Reactions.init(
  {
    reviewId: {
      type: DataTypes.BIGINT.UNSIGNED,
      reference: { model: Reviews, key: 'id' },
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      reference: { model: Users, key: 'id' },
    },
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

Reviews.belongsToMany(Users, { through: Reactions });
Users.belongsToMany(Reviews, { through: Reactions });

export default Reactions;
