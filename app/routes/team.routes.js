module.exports = (app) => {
  const teams = require('../controllers/teams.controller.js');
  const { authJwt } = require('../middlewares');

  var router = require('express').Router();

  //[authJwt.verifyToken, authJwt.hasPermission('USER_READ')]

  // Create a new user
  router.post('/', [authJwt.verifyToken, authJwt.hasPermission('TEAM_CREATE')], teams.create);

  // Retrieve all teams
  router.get('/all', [authJwt.verifyToken, authJwt.hasPermission('TEAM_READ')], teams.findAll);

  // Search team by name with a name param in the url
  router.get('/search', [authJwt.verifyToken, authJwt.hasPermission('TEAM_READ')], teams.findOneByName);

  // Retrieve a single team by id or name
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('TEAM_READ')], teams.findOne);

  // // Update a single user with id
  router.put('/:id', [authJwt.verifyToken, authJwt.hasPermission('TEAM_UPDATE')], teams.update);

  // // Delete a user with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermission('TEAM_DELETE')], teams.delete);

  router.post('/:id/join', [authJwt.verifyToken, authJwt.hasPermission('TEAM_JOIN')], teams.join);

  router.post('/:id/leave', [authJwt.verifyToken, authJwt.hasPermission('TEAM_JOIN')], teams.leave);

  router.post('/:id/accept', [authJwt.verifyToken, authJwt.hasPermission('TEAM_ACCEPT')], teams.accept);

  app.use('/api/team', router);
};
