import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Authors from './authors';
import Publishers from './publishers';

class Books extends Model {}

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
    language: {
      type: DataTypes.STRING,
      set(val) {
        this.setDataValue('language', val.toLowerCase());
      },
    },
    audio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
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
    bestseller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    authorId: { type: DataTypes.INTEGER.UNSIGNED },
    publisherId: { type: DataTypes.INTEGER.UNSIGNED },
  },
  {
    sequelize,
    tableName: 'books',
    modelName: 'books',
  },
);

Books.belongsTo(Authors, { foreignKey: 'authorId', as: 'author' });
Authors.hasMany(Books, { foreignKey: 'authorId', as: 'books' });

Books.belongsTo(Publishers, { foreignKey: 'publisherId' });
Publishers.hasMany(Books, { foreignKey: 'publisherId' });

export default Books;
