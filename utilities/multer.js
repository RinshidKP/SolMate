const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/multer'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(
        null,
        `image-${uniqueSuffix}.png` + '-' + Date.now() + '.' + file.originalname.split('.').pop()
        );
        // console.log(file);
    },
  });
const upload = multer({ storage: storage });
const uploadFiles = upload.array('images', 4)
const uploadFile = upload.single('image')
const uploadImages = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.log(err.code);
      }
    } else if (err) {
      console.log(err);
    }
    // console.log("look below");
    console.log(req.files);
    next();
  });
};

const uploadImage = (req, res, next) => {
  uploadFile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.log(err.code);
      }
    } else if (err) {
      console.log(err);
    }
    // console.log("look below");
    console.log(req.file);
    next();
  });
};


module.exports={
    upload,
    uploadImages,
    uploadImage
}