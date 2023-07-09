import { Op, Sequelize } from 'sequelize';

const { MYSQL_PORT, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USER, MYSQL_DATABASE } = process.env;
const operatorsAliases = {
  $and: Op.and,
  $or: Op.or,
  $not: Op.not,
};

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: 'mysql',
  operatorsAliases,
  logging: false,
  dialectOptions: { decimalNumbers: true },
});
export default sequelize;
