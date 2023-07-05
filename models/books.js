import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Authors from './authors';
import Categories from './categories';
import Publishers from './publishers';
import Languages from './languages';

class Books extends Model {
}

Books.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE(12, 4),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT },
    coverImage: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM('available', 'unavailable', 'upcoming'),
      defaultValue: 'available',
      allowNull: false,
    },
    new: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    popular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED },
    authorId: { type: DataTypes.INTEGER.UNSIGNED },
    languageId: { type: DataTypes.SMALLINT.UNSIGNED },
    publisherId: { type: DataTypes.INTEGER.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'books',
    modelName: 'books',
  },
);

Books.belongsTo(Categories, { foreignKey: 'categoryId' });
Categories.hasMany(Books, { foreignKey: 'categoryId' });

Books.belongsTo(Authors, { foreignKey: 'authorId' });
Authors.hasMany(Books, { foreignKey: 'authorId' });

Books.belongsTo(Publishers, { foreignKey: 'publisherId' });
Publishers.hasMany(Books, { foreignKey: 'publisherId' });

Books.belongsTo(Languages, { foreignKey: 'languageId' });
Languages.hasMany(Books, { foreignKey: 'languageId' });

export default Books;
