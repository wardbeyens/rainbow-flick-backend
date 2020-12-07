const db = require('../models');
const Table = db.table;

// Create and Save a new table
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }

  // Create a table
  const table = new Table({
    name: req.body.name,
    location: req.body.location,
    imageUrl: req.body.imageUrl,
    contactName: req.body.contactName,
    contactPhone: req.body.contactPhone,
    description: req.body.description,
    inUse: req.body.inUse,
  });

  // Save table in the database
  table
    .save(table)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the table.',
      });
    });
};
// Retrieve all tables from the database.
exports.findAll = (req, res) => {
  // const name = req.query.name;
  // var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  Table.find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving tables.',
      });
    });
};

// Find a single tag with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found table with id ' + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving table with id=' + id });
    });
};

// Update a table by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const id = req.params.id;

  Table.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update table with id=${id}. Maybe table was not found!`,
        });
      } else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating table with id=' + id,
      });
    });
};

// Delete a table with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Table.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete table with id=${id}. Maybe table was not found!`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Could not delete table with id=' + id,
      });
    });
};
