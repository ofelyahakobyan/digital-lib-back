import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';

class Files extends Model {}

Files.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    fileType: {
      type: DataTypes.ENUM('text', 'audio', 'other'),
      allowNull: false,
      defaultValue: 'text',
    },
    fileExtension: { type: DataTypes.STRING },
    fileSize: { type: DataTypes.INTEGER.UNSIGNED },
    fileUrl: { type: DataTypes.STRING, unique: true },
  },

  {
    sequelize,
    tableName: 'files',
    modelName: 'files',
  },
);

export default Files;

Files.belongsTo(Books, { foreignKey: 'bookId', onDelete: 'CASCADE' });
Books.hasMany(Files, { foreignKey: 'bookId', onDelete: 'CASCADE' });
