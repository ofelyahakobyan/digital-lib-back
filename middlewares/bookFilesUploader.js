import multer from 'multer';
import HttpError from 'http-errors';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename(req, file, cb) {
    const name = file.originalname.split('.')[0];
    const ext = file.mimetype.split('/')[1];
    cb(null, `${file.fieldname}-${uuidv4()}_${name}.${ext}`);
  },
});
const upload = multer({ storage }).fields([
  { name: 'previewPDF', maxCount: 1 },
  { name: 'fullPDF', maxCount: 1 },
]);

const filesUploader = (req, res, next) => {
  upload(req, res, (er) => {
    try {
      const { files } = req;
      if (!files) {
        return next();
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
export default filesUploader;
