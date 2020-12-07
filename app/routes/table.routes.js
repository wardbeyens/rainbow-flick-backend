module.exports = (app) => {
  const tables = require('../controllers/table.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();

  // Create a new table
  router.post('/', [authJwt.verifyToken, authJwt.verifyAdminRole], tables.create);
  //router.post('/', tables.create);

  // Retrieve all tables
  router.get('/', tables.findAll);

  // Retrieve a single table with id
  router.get('/:id', tables.findOne);

  // Update a table with id
  router.put('/:id', [authJwt.verifyToken, authJwt.verifyAdminRole], tables.update);
  //router.put('/:id', tables.update);

  // Delete a table with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.verifyAdminRole], tables.delete);
  //router.delete('/:id', tables.delete);

  app.use('/api/Table', router);
};
