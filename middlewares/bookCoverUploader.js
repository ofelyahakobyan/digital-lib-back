import multer from 'multer';
import HttpError from 'http-errors';
import _ from 'lodash';

const storage = multer.memoryStorage();
const limits = {
  fileSize: 5 * 1024 * 1024,
  files: 1,
};

const upload = multer({
  storage,
  limits,
}).single('cover');

const coverUploader = (req, res, next) => {
  upload(req, res, (er) => {
    try {
      const { file } = req;
      if (!file) {
        return next();
      }
      if (!(file.mimetype.startsWith('image'))) {
        throw HttpError(400, 'invalid file type, please upload only images');
      }
      if (_.isEmpty(er)) {
        return next();
      }
      if (er?.code === 'LIMIT_FILE_SIZE') {
        throw HttpError(413, er.message);
      }
      if (er?.code === 'LIMIT_FILE_COUNT') {
        throw HttpError(409, er.message);
      }
      if (er instanceof multer.MulterError) {
        throw HttpError(400);
      }
      return next();
    } catch (er) {
      next(er);
    }
  });
};
export default coverUploader;
