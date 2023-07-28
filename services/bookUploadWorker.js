import { parentPort, workerData } from 'node:worker_threads';
import path from 'path';
import fs from 'fs';
import imageResizer from '../helpers/imageResizer';

const processFiles = async () => {
  try {
    const { files, workerFilesData } = workerData;
    const { cover, preview, full, audio } = workerFilesData;

    if (files.cover) {
      const fullPath = path.join(path.resolve(), 'public/images/covers');
      await imageResizer(files.cover[0].path, { width: 110 }, `${fullPath}/XS-${cover}`);
      await imageResizer(files.cover[0].path, { width: 160 }, `${fullPath}/S-${cover}`);
      await imageResizer(files.cover[0].path, { width: 285 }, `${fullPath}/M-${cover}`);
      await imageResizer(files.cover[0].path, { width: 387, fit: 'contain' }, `${fullPath}/L-${cover}`);
    }
    if (files.preview) {
      const newPath = path.join(path.resolve(), 'public/books/previews', preview);
      fs.renameSync(files.preview[0].path, newPath);
    }
    if (files.full) {
      const newPath = path.join(path.resolve(), 'public/books/fulls', full);
      fs.renameSync(files.full[0].path, newPath);
    }
    if (files.audio) {
      const newPath = path.join(path.resolve(), 'public/books/audios', audio);
      fs.renameSync(files.audio[0].path, newPath);
    }
    parentPort.postMessage('done');
  } catch (er) {
    parentPort.postMessage({
      error: true,
      message: er.message,
    });
  }
};

await processFiles();
