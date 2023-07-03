import md5 from 'md5';

const { HASH_SALT } = process.env;
const hash = (password) => md5(md5(password, { salt: HASH_SALT }));
export default hash;
