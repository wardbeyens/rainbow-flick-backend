module.exports = (app) => {
  const matches = require('../controllers/match.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();

  // Create a new match
  router.post('/', [authJwt.verifyToken, authJwt.hasPermission('MATCH_CREATE')], matches.create);
  //router.post('/', matches.create);

  // Retrieve all matchs
  router.get('/all', [authJwt.verifyToken, authJwt.hasPermission('MATCH_READ')], matches.findAll);
  //router.get('/all', matches.findAll);

  // Retrieve a single match with id
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_READ')], matches.findOne);
  //router.get('/:id', matches.findOne);

  // Update a match with id
  router.put('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_UPDATE')], matches.update);
  //router.put('/:id', matches.update);

  // Update a match with id
  router.put('/score/:id', [authJwt.verifyToken, authJwt.hasPermissionMatchScore()], matches.updateScore);
  //router.put('/score/:id', matches.updateScore);

  // Delete a match with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_DELETE')], matches.delete);
  //router.delete('/:id', matches.delete);
  router.post('/challenge', [authJwt.verifyToken, authJwt.hasPermission('MATCH_CREATE')], matches.challengeTeam);
  //router.post('/challenge', matches.challengeTeam);
  router.post('/join/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_UPDATE')], matches.join);
  //router.post('/join/:id', matches.join);

  app.use('/api/match', router);
};
