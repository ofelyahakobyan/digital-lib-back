import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Publishers extends Model {
}

Publishers.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    companyName: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: 'publishers',
    modelName: 'publishers',
    updatedAt: false,
  },
);

export default Publishers;
