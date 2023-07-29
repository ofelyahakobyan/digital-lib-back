import { parentPort, workerData } from 'node:worker_threads';
import path from 'path';
import imageResizer from '../helpers/imageResizer';

const processFiles = async () => {
  try {
    const { files, fileName } = workerData;
    console.log(workerData);
    if (files.cover) {
      const fullPath = path.join(path.resolve(), 'public/images/covers');
      await imageResizer(files.cover[0].path, { width: 110 }, `${fullPath}/XS-${fileName}`);
      await imageResizer(files.cover[0].path, { width: 160 }, `${fullPath}/S-${fileName}`);
      await imageResizer(files.cover[0].path, { width: 285 }, `${fullPath}/M-${fileName}`);
      await imageResizer(files.cover[0].path, { width: 387, fit: 'contain' }, `${fullPath}/L-${fileName}`);
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
