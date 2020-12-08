module.exports = (app) => {
  const matches = require('../controllers/match.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();

  // Create a new match
  router.post('/', [authJwt.verifyToken, authJwt.hasPermission('MATCH_CREATE')], matches.create);

  // Retrieve all matchs
  router.get('/all', [authJwt.verifyToken, authJwt.hasPermission('MATCH_READ')], matches.findAll);

  // Retrieve a single match with id
  router.get('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_READ')], matches.findOne);

  // Update a match with id
  router.put('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_UPDATE')], matches.update);

  // Update a match with id
  router.put('/score/:id', [authJwt.verifyToken, authJwt.hasPermissionMatchScore()], matches.updateScore);

  // Delete a match with id
  router.delete('/:id', [authJwt.verifyToken, authJwt.hasPermission('MATCH_DELETE')], matches.delete);

  app.use('/api/match', router);
};
