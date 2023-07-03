import { BOOLEAN, DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import hash from '../helpers/hash';

class Users extends Model {
}

Users.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING,
      unique: 'email',
      allowNull: false,
    },
    password: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      get() {
        return undefined;
      },
      set(value) {
        if (value) {
          this.setDataValue('password', hash(value));
        }
      },
    },
    phone: { type: DataTypes.STRING },
    nickName: { type: DataTypes.STRING },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    country: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATE },
    shortAbout: { type: DataTypes.TEXT },
    isAdmin: {
      type: BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: BOOLEAN,
      defaultValue: false,
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      get() {
        return undefined;
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'users',
  },
);
export default Users;
