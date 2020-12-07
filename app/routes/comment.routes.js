module.exports = app => {
    const comment = require("../controllers/comment.controller.js");
    var router = require("express").Router();
    const { authJwt } = require("../middlewares");
  
    // Retrieve all comments for a article
    router.get("/:articleID", comment.findCommentsForArticle);

    // Create comment for an article
    router.post("/:articleID", authJwt.verifyToken, comment.createCommentForArticle);
  
    // Update Comment
    router.put("/:commentID", authJwt.verifyToken, comment.updateComment)

    // Delete Comment
    router.delete("/:commentID", authJwt.verifyToken, comment.deleteComment)
  
    app.use('/api/Comment', router);
  };