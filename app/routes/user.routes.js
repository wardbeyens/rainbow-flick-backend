module.exports = (app) => {
  const users = require('../controllers/user.controller.js');
  const { authJwt } = require('../middlewares');

  var router = require('express').Router();

  // Create a new user
  router.post('/register', users.create);

  // Authenticate user
  router.post('/authenticate', users.authenticate);

  // Create a new admin
  router.post('/admin', [authJwt.verifyToken, authJwt.hasPermission('ADMIN_CREATE')], users.createAdmin);

  // Retrieve all users
  router.get('/all', [authJwt.verifyToken, authJwt.hasPermission('USER_READ')], users.findAll);

  // Retrieve a single user with id
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('USER_READ')], users.findOne);

  // Update a single user with id
  router.put('/:id', [authJwt.verifyToken, authJwt.hasPermissionOrIsUserItself('USER_EDIT')], users.update);

  // Delete a user with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermissionOrIsUserItself('USER_DELETE')], users.delete);

  app.use('/api/user', router);
};
