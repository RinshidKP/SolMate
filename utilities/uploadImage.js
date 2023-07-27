const cloudinary = require('cloudinary').v2;

const imageUpload = async (file) => {
  try {
    // console.log("this is me " + JSON.stringify(file));

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
    //   public_id: file.name, // Use the original filename as the public_id
      resource_type: "auto",
      folder: "SolMate",
      transformation:[{
        width: 500,
        height: 500,
        gravity: "auto",
        quality: 50,
        crop: "fill",
      }],
      use_filename: true, 
    });

    // const transformedImageUrl = cloudinary.url(result.public_id, {
    //   width: 1280,
    //   height: 720,
    //   gravity: "auto",
    //   crop: "fill",
    // });
    // console.log(transformedImageUrl);
    return result
  } catch (error) {
    console.log(error);
  }
};

const deleteImage = async (publicId) => {
  try {
    // const publicId = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    await cloudinary.uploader.destroy(publicId); // Delete the asset by its public_id
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
        console.log(result);
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

module.exports = {
  multipleimages,
  deleteImage
};
