module.exports = (app) => {
  const tables = require('../controllers/table.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();
  const multer = require('multer');
  const multerConfig = require('../config/multer.config');
  // Create a new table
  router.post(
    '/',
    [authJwt.verifyToken, authJwt.hasPermission('TABLE_CREATE')],
    multer({ storage: multerConfig.storage }).array('image'),
    tables.create
  );

  // Retrieve all tables
  router.get('/all', [authJwt.verifyToken, authJwt.hasPermission('TABLE_READ')], tables.findAll);

  // Retrieve a single table with id
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('TABLE_READ')], tables.findOne);
  router.get('/overview/:datum', [authJwt.verifyToken, authJwt.hasPermission('TABLE_READ')], tables.overview);

  // Update a table with id
  router.put(
    '/:id',
    [authJwt.verifyToken, authJwt.hasPermission('TABLE_UPDATE')],
    multer({ storage: multerConfig.storage }).array('image'),
    tables.update
  );

  // Delete a table with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermission('TABLE_DELETE')], tables.delete);

  app.use('/api/table', router);
};
