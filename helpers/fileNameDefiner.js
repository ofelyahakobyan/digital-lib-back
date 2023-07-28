import { v4 as uuidv4 } from 'uuid';

// this function is used to get fileName,
// when new files are created (avatars, cover images, full text and preview files)

const fileNameDefiner = (file, title, type) => {
  const name = file.originalname.split('.')[0];
  const ext = file.mimetype.split('/')[1];
  return `${type}-${title}-${uuidv4()}_${name}.${ext}`;
};

export default fileNameDefiner;
