module.exports = (app) => {
  const ranking = require('../controllers/ranking.controller.js');
  const { authJwt } = require('../middlewares');
  var router = require('express').Router();

  router.get('/all', authJwt.verifyToken, ranking.getRankingTeams);
  //router.get('/all', ranking.getRankingTeams);

  app.use('/api/ranking', router);
};
