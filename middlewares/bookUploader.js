import multer from 'multer';
import HttpError from 'http-errors';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

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
  { name: 'preview', maxCount: 1 },
  { name: 'full', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]);

const filesUploaderV2 = (req, res, next) => {
  upload(req, res, (er) => {
    try {
      const { files } = req;
      if (_.isEmpty(files)) {
        return next();
      }
      if (files.cover && !files.cover[0].mimetype.startsWith('image')) {
        throw HttpError(400, 'invalid file type for cover, please upload only images');
      }
      if (files.preview && files.preview[0].mimetype.split('/')[1] !== 'pdf') {
        throw HttpError(400, 'invalid file type  preview, please upload only pdf');
      }
      if (files.full && files.full[0].mimetype.split('/')[1] !== 'pdf') {
        throw HttpError(400, 'invalid file type for  full, please upload only pdf');
      }
      if (files.audio && !files.audio[0].mimetype.startsWith('audio')) {
        throw HttpError(400, 'invalid file type for audio, please upload only audio files');
      }
      if (er?.code === 'LIMIT_FILE_COUNT'
        || er?.code === 'LIMIT_UNEXPECTED_FILE'
      ) {
        throw HttpError(409, er.message);
      }

      if (er instanceof multer.MulterError) {
        throw HttpError(400);
      }
      if (_.isEmpty(er)) {
        return next();
      }
      return next();
    } catch (er) {
      next(er);
    }
  });
};
export default filesUploaderV2;
