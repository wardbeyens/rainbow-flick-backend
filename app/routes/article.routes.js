module.exports = app => {
  const articles = require("../controllers/article.controller.js");
  const { authJwt } = require("../middlewares");
  const multer = require("multer");
  const multerConfig = require("../config/multer.config");

  var router = require("express").Router();



  /*
  Guarded Routes, all users
  */

  // Retrieve a single article with id
  router.get("/toggleLike/:id", authJwt.verifyToken, articles.toggleLike);

  /*
  Author Routes
  */
  // Retrieve all unpublished articles for author
  router.get("/author", authJwt.verifyToken, authJwt.verifyAuthorRole, articles.findUnpublishedArticles);
  // Create a new article
  router.post("/author", [authJwt.verifyToken, authJwt.verifyAuthorRole], multer({ storage: multerConfig.storage }).array("Images"), articles.create);

  // Update a article with id
  // router.put("/:id", [authJwt.verifyToken, authJwt.verifyAuthorRole], articles.update);


  /* 
  Admin Routes
  */

  // Delete a article with id
  router.delete("/:id", [authJwt.verifyToken, authJwt.verifyAuthorOrAdminRole], articles.delete);

  // Delete a article with id
  router.get("/publish/:id", [authJwt.verifyToken, authJwt.verifyAdminRole], articles.publish);

  // Publish article
  router.get("/admin/publish/:id", authJwt.verifyToken, authJwt.verifyAdminRole, articles.setStatusToPublished);

  // Retrieve all articles in review
  router.get("/admin", authJwt.verifyToken, authJwt.verifyAdminRole, articles.findArticlesInReview)


  /*
Ungaurded Routes
*/

  // Retrieve all articles
  router.get("/", authJwt.verifyTokenIfPresent, articles.findAll);


  // Retrieve all articles
  router.get("/author/publish/:id", authJwt.verifyToken, authJwt.verifyAuthorRole, articles.setStatusToInReview);



  // Retrieve a single article with id
  router.get("/:id", authJwt.verifyTokenIfPresent, articles.findOne);

  app.use('/api/Article', router);
};