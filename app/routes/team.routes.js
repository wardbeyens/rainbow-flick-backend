module.exports = (app) => {
  const teams = require('../controllers/teams.controller.js');
  const { authJwt } = require('../middlewares');

  var router = require('express').Router();

  //[authJwt.verifyToken, authJwt.hasPermission('USER_READ')

  // Create a new user
  router.post('/', [authJwt.verifyToken], teams.create);

  // Retrieve all teams
  router.get('/all', [authJwt.verifyToken], teams.findAll);

  // Search team by name with a name param in the url
  router.get('/search', [authJwt.verifyToken], teams.findOneByName);

  // Retrieve a single team by id or name
  router.get('/:id', [authJwt.verifyToken], teams.findOne);

  // // Update a single user with id
  router.put('/:id', [authJwt.verifyToken], teams.update);

  // // Delete a user with id
  router.delete('/:id', [authJwt.verifyToken], teams.delete);

  router.post('/:id/join', [authJwt.verifyToken], teams.join);

  app.use('/api/team', router);
};
