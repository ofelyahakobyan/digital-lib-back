import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Authors extends Model {
}

Authors.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT },
    dob: { type: DataTypes.DATE },
    avatar: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: 'authors',
    modelName: 'authors',
  },
);

export default Authors;
