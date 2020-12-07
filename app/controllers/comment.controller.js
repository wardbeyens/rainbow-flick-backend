const db = require("../models");
const Comment = db.comments;


// Retrieve all articles from the database.
exports.findCommentsForArticle = (req, res) => {
    Comment.find({ ArticleID: req.params.articleID })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving comments."
            });
        });
};

//Create comment at a given article
exports.createCommentForArticle = (req, res) => {
    // Validate request
    if (!req.body.Comment) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    // Create a comment
    const comment = new Comment({
        ArticleID: req.params.articleID,
        UserID: req.authUser._id,
        Username: req.authUser.Username,
        Comment: req.body.Comment,
    });

    // Save role in the database
    comment
        .save(comment)
        .then(data => {
            data = data.toObject();
            delete data.updatedAt;
            delete data.__v;
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the role."
            });
        });
};

//Update Comment
exports.updateComment = (req, res) => {
    if (!req.body.Comment) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    Comment.findOneAndUpdate({ _id: req.params.commentID }, { $set: { Comment: req.body.Comment } })
        .then(data => {res.send(data);})
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while updating the comment."
            });
        });
}

//Delete Comment
exports.deleteComment = (req, res) => {
    Comment.findByIdAndDelete(req.params.commentID)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "No comment found with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving comment with id=" + id });
        });
}

