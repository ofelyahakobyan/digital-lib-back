import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Contacts extends Model {
}

Contacts.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
  },
  {
    sequelize,
    tableName: 'contacts',
    modelName: 'contacts',
  },
);

export default Contacts;
