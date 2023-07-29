import multer from 'multer';
import HttpError from 'http-errors';
import _ from 'lodash';

const { IMAGE_MAX_SIZE } = process.env;
const storage = multer.memoryStorage();
const limits = {
  fileSize: IMAGE_MAX_SIZE,
  files: 1,
};

const upload = multer({
  storage,
  limits,
}).single('avatar');

const uploader = (req, res, next) => {
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
export default uploader;
