// import { parentPort } from 'node:worker_threads';
// import { v4 as uuidv4 } from 'uuid';
// import path from 'path';
// import fs from 'fs';
// import HttpError from 'http-errors';
// import sequelize from './sequelize';
// import { BookCategories, BookFiles, Books } from '../models/index';
//
// if (files.full) {
//   const name = files.full[0].originalname.split('.')[0];
//   const ext = files.full[0].mimetype.split('/')[1];
//   const fileName = `${title}-full-${uuidv4()}_${name}.${ext}`;
//   const newPath = path.join(path.resolve(), 'public/books/fulls', fileName);
//   fs.renameSync(files.full[0].path, newPath);
//   bookFilesData.fullPDF = `books/fulls/${fileName}`;
// }
// if (files.audio) {
//   const name = files.audio[0].originalname.split('.')[0];
//   const ext = files.audio[0].mimetype.split('/')[1];
//   const fileName = `${title}-audio-${uuidv4()}_${name}.${ext}`;
//   const newPath = path.join(path.resolve(), 'public/books/audios', fileName);
//   fs.renameSync(files.audio[0].path, newPath);
//   bookFilesData.audio = `books/audios/${fileName}`;
// }
//
// // transaction start
// t = await sequelize.transaction();
// // if  full or audio files exist, job should be done on the separate proccess
// const newBook = await Books.create({
//   title,
//   price,
//   description,
//   language,
//   authorId,
//   new: brandNew,
//   popular,
//   bestseller,
//   status: 'unavailable',
//   audio: false,
//   coverImage: '',
//   publisherId: null,
// }, { transaction: t });
// if (!newBook) {
//   throw HttpError(400, 'unable to create book');
// }
// await Promise.all(existingCategories.map(async (cat) => {
//   await BookCategories.create({ bookId: newBook.id, categoryId: cat.id }, { transaction: t });
// }));
// await BookFiles.create({ ...bookFilesData, bookId: newBook.id }, { transaction: t });
// if (files.full) {
//   newBook.status = 'available';
// } else {
//   newBook.status = 'upcoming';
// }
// if (files.audio) {
//   newBook.audio = true;
// }
// await newBook.save({ transaction: t });
// // transaction end
// if (t) {
//   await t.commit();
// }
// parentPort.postMessage('hello');
