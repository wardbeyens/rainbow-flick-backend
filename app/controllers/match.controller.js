const db = require('../models');
const Match = db.match;
const Score = db.score;

returnMatches = (data) => {
  return {
    results: data.map((d) => returnMatchObject(d)),
  };
};
returnMatchObject = (data) => {
  return {
    id: data._id || data.id,
    name: data.name,
    dateTimePlanned: data.dateTimePlanned,
    dateTimeStart: data.dateTimeStart,
    dateTimeEnd: data.dateTimeEnd,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    players: data.players,
    score: data.score,
    table: data.table,
    scoreSubmittedBy: data.scoreSubmittedBy,
    scoreValidated: data.scoreValidated,
    requirementsReached: data.requirementsReached,
    matchType: data.matchType,
  };
};
//helper function to return matchObject
returnMatch = (data) => {
  return {
    result: returnMatchObject(data),
  };
};

validateMatchFields = (req) => {
  let validationMessages = [];

  if (!req.body.name) {
    validationMessages.push('Name is required.');
  }

  if (!req.body.dateTimePlanned) {
    validationMessages.push('DateTimePlanned is required.');
  }

  if (!req.body.homeTeam) {
    validationMessages.push('HomeTeam is required.');
  }
  if (!req.body.awayTeam) {
    validationMessages.push('AwayTeam is required.');
  }
  if (!req.body.table) {
    validationMessages.push('Table is required.');
  }
  // If request not valid, return messages
  return validationMessages;
};
// Create and Save a new match
exports.create = (req, res) => {
  let validationMessages = validateMatchFields(req);

  if (validationMessages.length != 0) {
    return res.status(404).send({ message: validationMessages });
  }
  // Create a Match
  const match = new Match({
    name: req.body.name,
    dateTimePlanned: req.body.dateTimePlanned,
    dateTimeStart: req.body.dateTimeStart,
    dateTimeEnd: req.body.dateTimeEnd,
    homeTeam: req.body.homeTeam,
    awayTeam: req.body.awayTeam,
    players: req.body.players,
    score: req.body.score,
    table: req.body.table,
    scoreSubmittedBy: req.body.scoreSubmittedBy,
    scoreValidated: req.body.scoreValidated,
    requirementsReached: req.body.requirementsReached,
    matchType: req.body.matchType,
  });

  // Save match in the database
  match
    .save(match)
    .then((data) => {
      return res.send(returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the match.',
      });
    });
};
// Retrieve all matches from the database.
exports.findAll = (req, res) => {
  Match.find()
    .then((data) => {
      return res.send(returnMatches(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving matches.',
      });
    });
};

// Find a single match with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Match.findById(id)
    .then((data) => {
      if (!data) return res.status(404).send({ message: 'Not found match with id ' + id });
      else return res.send(returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({ message: 'Error retrieving match with id=' + id });
    });
};

// Update a match by the id in the request
exports.update = (req, res) => {
  let validationMessages = validateMatchFields(req);

  if (validationMessages.length != 0) {
    return res.status(404).send({ message: validationMessages });
  }

  const id = req.params.id;

  Match.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update match with id=${id}. Maybe match was not found!`,
        });
      } else return res.send(returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};

// Delete a match with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Match.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot delete match with id=${id}. Maybe match was not found!`,
        });
      } else {
        return res.send({
          message: 'Match was deleted successfully!',
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Could not delete match with id=' + id,
      });
    });
};

exports.updateScore = (req, res) => {
  let validationMessages = [];
  if (!req.body.scoreHome) {
    validationMessages.push('ScoreHome is required.');
  }
  if (!req.body.scoreAway) {
    validationMessages.push('ScoreAway is required.');
  }
  if (!req.body.homeTeamScored) {
    validationMessages.push('HomeTeamScored is required.');
  }

  if (validationMessages.length != 0) {
    return res.status(404).send({ message: validationMessages });
  }
  const id = req.params.id;

  Match.findById(id)
    .then((data) => {
      let diffMs = new Date() - data.dateTimeStart;
      let minutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
      const score = new Score({
        scoreHome: req.body.scoreHome,
        scoreAway: req.body.scoreAway,
        whenScored: minutes,
        homeTeamScored: req.body.homeTeamScored,
      });

      data.score.push(score);
      Match.findByIdAndUpdate(id, data, { new: true, useFindAndModify: false })
        .then((data) => {
          if (!data) {
            return res.status(404).send({
              message: `Cannot update match with id=${id}. Maybe match was not found!`,
            });
          } else return res.send(returnMatch(data));
        })
        .catch((err) => {
          return res.status(500).send({
            message: 'Error updating match with id=' + id,
          });
        });
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};
