import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './users';

class Subscribers extends Model {}

Subscribers.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: 'email',
    },
    userId: { type: DataTypes.BIGINT.UNSIGNED },
    status: { type: DataTypes.ENUM('subscribed', 'unsubscribed'), allowNull: false, defaultValue: 'subscribed' },
  },
  {
    sequelize,
    tableName: 'subscribers',
    modelName: 'subscribers',
  },
);

Subscribers.belongsTo(Users, { foreignKey: 'userId' });
Users.hasOne(Subscribers);

export default Subscribers;
