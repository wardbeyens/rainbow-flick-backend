const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

exports.multer = (req, res) => {
  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);

  if (imageFilePaths[0]) {
    let imageURL = imageFilePaths[0];
    return res.status(200).send({
      message: imageURL,
    });
  }
};

exports.cloud = async (req, res, next) => {
  cloudinary.v2.uploader.upload('../files/images/placeholder.png', function (error, result) {
    console.log(result, error);
  });
};
