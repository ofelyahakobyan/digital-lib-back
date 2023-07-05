import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';

class Categories extends Model {
}

Categories.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    category: { type: DataTypes.STRING },
    parentCategory: { type: DataTypes.INTEGER.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'categories',
    modelName: 'categories',
  },
);
Categories.hasOne(Categories, { foreignKey: 'parentCategory', as: 'parent' });

export default Categories;
