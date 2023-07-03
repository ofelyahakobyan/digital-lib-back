import { Users } from '../models/index';

const models = [Users];

async function main() {
  // eslint-disable-next-line no-restricted-syntax
  for (const m of models) {
    // eslint-disable-next-line no-await-in-loop
    await m.sync({ alter: true });
  }
  process.exit(0);
}
main();
