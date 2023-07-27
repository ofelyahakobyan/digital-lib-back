import fs from 'fs';

const fileRemover = (path) => setImmediate(() => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
});
export default fileRemover;
