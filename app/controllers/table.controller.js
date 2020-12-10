const db = require('../models');
const Table = db.table;
const Match = db.match;

//helper function to return userObject
returnTable = (data) => {
  console.log(data);
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
    return res.status(400).send({ messages: validationMessages });
  }

  // Create a table
  let table = new Table({
    name: req.body.name,
    location: req.body.location,
    contactName: req.body.contactName,
    contactPhone: req.body.contactPhone,
    description: req.body.description,
    inUse: req.body.inUse,
  });
  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);
  if (imageFilePaths[0]) {
    console.log('1');
    table.imageUrl = imageFilePaths[0];
  } else {
    console.log('2');
    table.imageUrl = 'https://rainbow-flick-backend-app.herokuapp.com/images/placeholder.png';
  }
  console.log(table);
  // Save table in the database
  table
    .save(table)
    .then((data) => {
      return res.send({ result: returnTable(data) });
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
      return res.send({ results: data.map((d) => returnTable(d)) });
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
      if (!data) return res.status(400).send({ message: 'Not found table with id ' + id });
      else return res.send({ result: returnTable(data) });
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
        return res.status(400).send({
          message: `Cannot update table with id=${id}. Maybe table was not found!`,
        });
      } else return res.send({ result: returnTable(data) });
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
        return res.status(400).send({
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

matchOnTable2 = async (table, dateTimePlanned, res) => {
  console.log('matchOnTable');
  let datum = new Date(dateTimePlanned);
  let year = datum.getFullYear();
  let month = datum.getMonth();
  let day = datum.getDate();
  // console.log('datum : ' + datum);
  // console.log('year : ' + year);
  // console.log('month : ' + month);
  // console.log('day : ' + day);
  let gteDatum = new Date(year, month, day);
  // console.log('gteDatum : ' + gteDatum);
  day = day + 1;
  let ltDatum = new Date(year, month, day);
  // console.log('ltDatum : ' + ltDatum);

  const query = Match.find();
  let result;
  try {
    result = await query
      .where('table')
      .equals(table)
      .where('dateTimeStart')
      .ne(null)
      .where('dateTimeEnd')
      .equals(null)
      .where('dateTimePlanned')
      .gte(gteDatum)
      .lt(ltDatum)
      .sort('dateTimePlanned')
      .limit(1)
      .exec();
    // console.log(result);
    if (!Object.keys(result).length) {
      // console.log('niks bezig');
      gteDatum = new Date();
      year = gteDatum.getFullYear();
      month = gteDatum.getMonth();
      day = gteDatum.getDate();
      gteDatum = new Date(year, month, day);
      result = await query
        .where('table')
        .equals(table)
        .where('dateTimePlanned')
        .gte(gteDatum)
        .lt(ltDatum)
        .sort('dateTimePlanned')
        .limit(1)
        .exec();
    }
    console.log('result : ' + result);
    return result[0];
  } catch (error) {
    return res.status(400).send({
      message: 'Error when searching for matches on table : ' + table,
    });
  }
};

exports.overview = async (req, res) => {
  const datum = req.params.datum;
  console.log('datum : ' + datum);
  Table.find()
    .then(async (data) => {
      console.log(data);
      // console.log(data.length);
      let tablesWithMatches = [];
      for (var i = 0; i < data.length; i++) {
        let table = data[i].toObject();
        table.match = await matchOnTable2(data[i]._id, datum, res);
        console.log('tables[i].match : ' + table.match);
        tablesWithMatches.push(table);
        // console.log('tables : ' + tables);
      }
      console.log('tablesWithMatches : ' + tablesWithMatches);
      var responseObject = {
        date: datum,
        tables: tablesWithMatches,
      };
      return res.send(responseObject);
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving tables.',
      });
    });
};
