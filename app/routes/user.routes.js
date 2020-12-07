module.exports = (app) => {
  const users = require('../controllers/user.controller.js');
  const { authJwt } = require('../middlewares');

  var router = require('express').Router();

  // Create a new user
  router.post('/register', users.create);

  // Authenticate user
  router.post('/authenticate', users.authenticate);

  // Find Authors
  router.get('/authors', [authJwt.verifyToken, authJwt.verifyAdminRole], users.findAuthors);

  // Find Authors
  router.post('/authors', [authJwt.verifyToken, authJwt.verifyAdminRole], users.createAuthor);

  // Retrieve a single user with id
  router.get('/:id', [authJwt.verifyToken, authJwt.verifyAdminRole], users.findOne);

  // Delete a user with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.verifyAdminRole], users.delete);

  app.use('/api/User', router);
};
