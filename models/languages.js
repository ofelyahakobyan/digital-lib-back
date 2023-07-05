import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Languages extends Model {
}

Languages.init(
  {
    id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    language: { type: DataTypes.STRING(150), allowNull: false },
  },
  {
    sequelize,
    tableName: 'languages',
    modelName: 'languages',
    timestamps: false,
  },
);

export default Languages;
