import {
  Users,
  Categories,
  Authors,
  Languages,
  Publishers,
  Books,
  BookFiles,
  Reviews,
  Reactions,
  Files,
  BookCategories,
  UserBooks,
  CreditCards,
  Transactions,
  TransactionDetails,
  Subscribers,
} from '../models/index';

const models = [
  Users,
  Categories,
  Authors,
  Languages,
  Publishers,
  Books,
  BookFiles,
  Reviews,
  Reactions,
  Files,
  BookCategories,
  UserBooks,
  CreditCards,
  Transactions,
  TransactionDetails,
  Subscribers,

];

async function main() {
  // eslint-disable-next-line no-restricted-syntax
  for (const m of models) {
    // eslint-disable-next-line no-await-in-loop
    await m.sync({ alter: true });
  }
  process.exit(0);
}

main();
