const cloudinary = require('cloudinary').v2

const imageUpload  = async (file) =>{
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath,{
            
            public_id:`${Date.now()}`,
            resource_type:"auto",
            eager: {crop: "imagga_crop", height: 270, width: 270 },
            folder:"imagesfortest",
        }) 
        // console.log(result.url);
        return result.url;
    } catch (error) {
        console.log(error);
    }
}




const multipleimages = async (files)=>{
    
    const imageUrlList = []
    
    for(let i = 0;i<files.length;i++){
        const file = files[i];
        const results = await imageUpload(file);
        imageUrlList.push(results)
    }
    
    return imageUrlList
}


module.exports = multipleimages;