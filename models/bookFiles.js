import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Books from './books';

class BookFiles extends Model {}

BookFiles.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bookId: { type: DataTypes.BIGINT.UNSIGNED },
    coverXS: { type: DataTypes.STRING },
    coverS: { type: DataTypes.STRING },
    coverM: { type: DataTypes.STRING },
    coverL: { type: DataTypes.STRING },
    previewPDF: { type: DataTypes.STRING },
    fullPDF: { type: DataTypes.STRING },
    audio: { type: DataTypes.STRING },
  },

  {
    sequelize,
    tableName: 'book_files',
    modelName: 'book_files',
  },
);

export default BookFiles;

BookFiles.belongsTo(Books, { foreignKey: 'bookId' });
Books.hasOne(BookFiles, { foreignKey: 'bookId', as: 'bookFiles' });
