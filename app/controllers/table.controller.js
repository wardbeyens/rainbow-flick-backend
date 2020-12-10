const db = require('../models');
const Table = db.table;

//helper function to return userObject
returnTable = (data) => {
  return {
    id: data._id || data.id,
    name: data.name,
    location: data.location,
    imageUrl: data.imageUrl,
    contactName: data.contactName,
    contactPhone: data.contactPhone,
    description: data.description,
    inUse: data.inUse,
  };
};

// Create and Save a new table
exports.create = (req, res) => {
  let validationMessages = [];

  if (!req.body.name) {
    validationMessages.push('Name is required.');
  }

  if (!req.body.location) {
    validationMessages.push('Location is required.');
  }

  if (!req.body.description) {
    validationMessages.push('Description is required.');
  }

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    return res.status(404).send({ messages: validationMessages });
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
      return res.send(returnTable(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the table.',
      });
    });
};
// Retrieve all tables from the database.
exports.findAll = (req, res) => {
  Table.find()
    .then((data) => {
      return res.send(data.map((d) => returnTable(d)));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving tables.',
      });
    });
};

// Find a single tag with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data) return res.status(404).send({ message: 'Not found table with id ' + id });
      else return res.send(returnTable(data));
    })
    .catch((err) => {
      return res.status(500).send({ message: 'Error retrieving table with id=' + id });
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
        return res.status(404).send({
          message: `Cannot update table with id=${id}. Maybe table was not found!`,
        });
      } else return res.send(returnTable(data));
    })
    .catch((err) => {
      return res.status(500).send({
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
        return res.status(404).send({
          message: `Cannot delete table with id=${id}. Maybe table was not found!`,
        });
      } else {
        return res.send({
          message: 'Table was deleted successfully!',
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Could not delete table with id=' + id,
      });
    });
};
