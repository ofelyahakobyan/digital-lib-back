import sharp from 'sharp';

const imageResizer = async (image, size, destination) => {
  await sharp(image)
    .resize(size)
    .rotate()
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toFile(destination);
};
export default imageResizer;
