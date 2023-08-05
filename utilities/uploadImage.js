const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { randomUUID } = require('crypto');
const imageUpload = async (file) => {
  
  try {
    // console.log("IAM YOU ERROR",file);
      const result = await cloudinary.uploader.upload( file.path, {
      public_id: `${randomUUID()}`,
      resource_type: "auto",
      folder: "SolMate",
    });
    const myResultObj = {
      public_id: result.public_id,
      url: result.url,
    }    
    // console.log("O_o ((())))",result);
    fs.unlink(file.path,function(err){
      if(err){
        console.log("something went wrong :"+ err);
      }
    })
    console.log("O_o",myResultObj);
    return myResultObj;
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
