const db = require("../models");
const ArticleStatus = db.articlestatuses;


// Retrieve all articles from the database.
exports.findAll = (req, res) => {
  ArticleStatus.find()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving articlestatuses."
      });
    });
};

// Find a single article with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  ArticleStatus.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found articlestatus with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving articlestatus with id=" + id });
    });
};

// Create and Save a new articleStatus, only for testing purposes
exports.create = (req, res) => {
  // Validate request
  if (!req.body.Name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a articleStatus
  const articleStatus = new ArticleStatus({
	Name: req.body.Name
  });

  // Save articleStatus in the database
  articleStatus
    .save(articleStatus)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the articleStatus."
      });
    });
};