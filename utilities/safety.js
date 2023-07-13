const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

const imageUpload = async (file) => {
  try {
    console.log("this is me " + JSON.stringify(file));

    const saltRounds = 10;
    const publicId = await bcrypt.hash(file.name, saltRounds);
    const sanitizedPublicId = publicId.replace(/[^\w]/g, ''); // Remove non-alphanumeric characters from the hash
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      public_id: sanitizedPublicId,
      resource_type: "auto",
      eager: [
        { width: 200, height: 300, crop: "fill", gravity: "auto" },
        { width: 270, height: 270, crop: "crop", gravity: "auto" }
      ],
      folder: "imagesfortest",
    });

    const transformedImageUrl = cloudinary.url(result.public_id, {
      width: 1331,
      height: 1020,
      gravity: "auto",
      crop: "fill",
    });

    return transformedImageUrl;
  } catch (error) {
    console.log(error);
  }
};

const multipleimages = async (files) => {
  try {
    if (Array.isArray(files) && files.length) {
      const imageUrlList = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await imageUpload(file);
        imageUrlList.push(result);
      }

      return imageUrlList;
    } else if (files) {
      const result = await imageUpload(files);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = multipleimages;
