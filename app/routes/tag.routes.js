module.exports = app => {
  const tags = require("../controllers/tag.controller.js");
  const { authJwt } = require("../middlewares");
  var router = require("express").Router();

  // Create a new tag
  router.post("/", [authJwt.verifyToken, authJwt.verifyAdminRole], tags.create);

  // Retrieve all tags
  router.get("/", tags.findAll);

  // Retrieve a single tag with id
  router.get("/:id", tags.findOne);

  // Update a tag with id
  router.put("/:id", [authJwt.verifyToken, authJwt.verifyAdminRole], tags.update);

  // Delete a tag with id
  router.delete("/:id",[authJwt.verifyToken, authJwt.verifyAdminRole], tags.delete);

  app.use('/api/Tag', router);
};