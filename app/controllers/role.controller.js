const db = require("../models");
const Role = db.roles;


// Retrieve all articles from the database.
exports.findAll = (req, res) => {
  const name = req.query.Name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  Role.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving roles."
      });
    });
};

// Find a single article with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Role.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found role with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving role with id=" + id });
    });
};

// Create and Save a new role, only for testing purposes
exports.create = (req, res) => {
  // Validate request
  if (!req.body.Name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a role
  const role = new Role({
	Name: req.body.Name
  });

  // Save role in the database
  role
    .save(role)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the role."
      });
    });
};