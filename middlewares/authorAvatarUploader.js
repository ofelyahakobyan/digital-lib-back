import multer from 'multer';
import HttpError from 'http-errors';
import _ from 'lodash';

const storage = multer.memoryStorage();
const limits = {
  fileSize: 5 * 1024 * 1024,
  files: 1,
};
const mimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const upload = multer({
  storage,
  limits,
}).single('avatar');

const authorUploader = (req, res, next) => {
  upload(req, res, (er) => {
    try {
      const { file } = req;
      if (!file) {
        return next();
      }
      if (!(mimeTypes.includes(file.mimetype))) {
        throw HttpError(403, 'invalid file type');
      }
      if (_.isEmpty(er)) {
        return next();
      }
      if (er?.code === 'LIMIT_FILE_SIZE') {
        throw HttpError(413, 'file size is too large');
      }
      return next();
    } catch (er) {
      next(er);
    }
  });
};
export default authorUploader;
