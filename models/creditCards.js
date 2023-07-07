import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './users';

class CreditCards extends Model {}

CreditCards.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      unique: 'ix_user_card',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    cardNumber: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      unique: 'ix_user_card',
    },
    cardType: { type: DataTypes.STRING(50), allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    expMonth: { type: DataTypes.CHAR(2), allowNull: false },
    expYear: { type: DataTypes.CHAR(2), allowNull: false },
    cvc: { type: DataTypes.CHAR(3), allowNull: false },
    expired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    defaultCard: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'credit_cards',
    modelName: 'credit_cards',
  },
);

CreditCards.belongsTo(Users, { foreignKey: 'userId' });
Users.hasMany(CreditCards, { foreignKey: 'userId' });

export default CreditCards;
