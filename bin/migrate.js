import {
  Users,
  Categories,
  Authors,
  Languages,
  Publishers,
  Books,
  Reviews,
  Reactions,
  Files,
  BookCategories,
  UserBooks,
  CreditCards,
  Transactions,
} from '../models/index';

const models = [
  Users,
  Categories,
  Authors,
  Languages,
  Publishers,
  Books,
  Reviews,
  Reactions,
  Files,
  BookCategories,
  UserBooks,
  CreditCards,
  Transactions,
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
