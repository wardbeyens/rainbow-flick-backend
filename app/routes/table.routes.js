module.exports = (app) => {
  const tables = require('../controllers/table.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();

  // Create a new table
  router.post('/', [authJwt.verifyToken, authJwt.hasPermission('TABLE_CREATE')], tables.create);
  //router.post('/', tables.create);

  // Retrieve all tables
  router.get('/', [authJwt.verifyToken, authJwt.hasPermission('TABLE_READ')], tables.findAll);

  // Retrieve a single table with id
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('TABLE_READ')], tables.findOne);

  // Update a table with id
  router.put('/:id', [authJwt.verifyToken, authJwt.hasPermission('TABLE_UPDATE')], tables.update);
  //router.put('/:id', tables.update);

  // Delete a table with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermission('TABLE_DELETE')], tables.delete);
  //router.delete('/:id', tables.delete);

  app.use('/api/Table', router);
};
