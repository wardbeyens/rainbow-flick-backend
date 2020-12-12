module.exports = (app) => {
  const multer = require('multer');
  const multerConfig = require('../config/multer.config');
  const image = require('../controllers/image.controller.js');

  var router = require('express').Router();

  router.post('/multer', multer({ storage: multerConfig.storage }).array('image'), image.multer);

  router.post('/cloudinary', image.cloud);

  app.use('/api/image', router);
};
