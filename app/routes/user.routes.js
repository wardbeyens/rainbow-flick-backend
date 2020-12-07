module.exports = (app) => {
  const users = require('../controllers/user.controller.js');
  const { authJwt } = require('../middlewares');

  var router = require('express').Router();

  // Create a new user
  router.post('/register', users.create);

  // Authenticate user
  router.post('/authenticate', users.authenticate);

  // Create a new admin
  // router.post('/admin', [authJwt.verifyToken, authJwt.verifyPermission('ADMIN_CREATE')], users.createAdmin);

  // Retrieve a single user with id
  router.get('/:id', [authJwt.verifyToken, authJwt.verifyPermission('USER_READ')], users.findOne);

  // router.put('/:id', [authJwt.verifyToken, authJwt.verifyPermission('USER_EDIT')], users.edit);

  // Delete a user with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.verifyPermission('USER_DELETE')], users.delete);

  app.use('/api/user', router);
};
