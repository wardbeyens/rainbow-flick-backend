const { team, match } = require('../models');
const db = require('../models');
const Match = db.match;
const Score = db.score;
const Team = db.team;
// const Player = db.player;
const TeamController = require('./teams.controller');
const UserController = require('./user.controller');
const { authJwt } = require('../middlewares');

returnMatches = async (data) => {
  let returnMatchesArray = [];
  for (let i = 0; i < data.length; i++) {
    let originalMatch = data[i];

    returnMatchesArray.push(await returnMatchObject(data[i]));
  }
  return { results: returnMatchesArray };
};

getPlayers = async (players) => {
  let returnPlayers = [];
  for (let i = 0; i < players.length; i++) {
    let originalPlayer = players[i];
    let player = {};
    player.user = await UserController.findOneLocal(originalPlayer.user);
    player.team = originalPlayer.team;

    returnPlayers.push(player);
  }
  return returnPlayers;
};
returnMatchObject = async (data) => {
  return {
    id: data._id || data.id,
    name: data.name,
    dateTimePlanned: data.dateTimePlanned,
    dateTimeStart: data.dateTimeStart,
    dateTimeEnd: data.dateTimeEnd,
    homeTeam: await TeamController.findOneLocal(data.homeTeam),
    awayTeam: await TeamController.findOneLocal(data.awayTeam),
    players: await getPlayers(data.players),
    score: data.score,
    table: data.table,
    scoreSubmittedBy: data.scoreSubmittedBy,
    scoreValidated: data.scoreValidated,
    requirementsReached: data.requirementsReached,
    matchType: data.matchType,
  };
};
//helper function to return matchObject
returnMatch = async (data) => {
  var result = await returnMatchObject(data);
  return {
    result: result,
  };
};

teamIsNotValid = async (teamID) => {
  let result;
  try {
    result = await Team.findById(teamID);
    if (!result) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

validateMatchFields = async (req, res) => {
  let validationMessages = [];

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
  if (!(await teamIsNotValid(req.body.homeTeam))) {
    validationMessages.push('Home team is not valid');
  }
  if (!(await teamIsNotValid(req.body.awayTeam))) {
    validationMessages.push('Away team is not valid.');
  }
  if (!req.body.name && validationMessages.length != 0) {
    Team.findById(req.body.homeTeam)
      .then((ownTeam) => {
        Team.findById(req.body.awayTeam)
          .then((challengeTeam) => {
            req.body.name = ownTeam.name + ' vs ' + challengeTeam.name;
          })
          .catch((err) => {
            return res.status(500).send({
              message: err.message || 'Het team dat je uitdaagt is niet gevonden.',
            });
          });
      })
      .catch((err) => {
        return res.status(500).send({
          message: err.message || 'U eigen team is niet gevonden',
        });
      });
  }

  // If request not valid, return messages
  return validationMessages;
};
// Create and Save a new match
exports.create = async (req, res) => {
  console.log('start hier');
  let validationMessages = await validateMatchFields(req, res);

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
  console.log('save match');
  // Save match in the database

  match
    .save(match)
    .then(async (data) => {
      console.log('TEST TEST TEST');
      return res.send(await returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the match.',
      });
    });
};
// Retrieve all matches from the database.
exports.findAll = async (req, res) => {
  Match.find()
    .then(async (data) => {
      return res.send(await returnMatches(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving matches.',
      });
    });
};

// Find a single match with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Match.findById(id)
    .then(async (data) => {
      if (!data) return res.status(404).send({ message: 'Not found match with id ' + id });
      else return res.send(await returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({ message: 'Error retrieving match with id=' + id });
    });
};

// Update a match by the id in the request
exports.update = async (req, res) => {
  // let validationMessages = validateMatchFields(req);

  // if (validationMessages.length != 0) {
  //   return res.status(404).send({ message: validationMessages });
  // }

  const id = req.params.id;

  Match.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
    .then(async (data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update match with id=${id}. Maybe match was not found!`,
        });
      } else return res.send(await returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};

// Delete a match with the specified id in the request
exports.delete = async (req, res) => {
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

exports.updateScore = async (req, res) => {
  console.log(req.body);
  console.log(req.body.scoreAway);

  let validationMessages = [];
  if (!req.body.scoreHome) {
    validationMessages.push('ScoreHome is required.');
  }
  if (req.body.scoreAway == undefined) {
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
        .then(async (data) => {
          if (!data) {
            return res.status(404).send({
              message: `Cannot update match with id=${id}. Maybe match was not found!`,
            });
          } else return res.send(await returnMatch(data));
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
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}
matchOnTable = async (table, dateTimePlanned) => {
  let dateTimePlannedLowerLimit = new Date(dateTimePlanned - 10 * 60000);
  let dateTimePlannedUperLimit = new Date(dateTimePlanned + 10 * 60000);

  const query = Match.find();
  let result;
  try {
    result = await query
      .where('table')
      .equals(table)
      .where('dateTimePlanned')
      .gt(dateTimePlannedLowerLimit)
      .lt(dateTimePlannedUperLimit)
      .where('dateTimeStart')
      .ne(null)
      .exec();

    if (!isEmptyObject(result)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return true;
  }
};

exports.challengeTeam = async (req, res) => {
  let validationMessages = [];
  if (!req.body.homeTeam) {
    validationMessages.push('team id is vereist.');
  }
  if (!req.body.awayTeam) {
    validationMessages.push('uitdagers team id is vereist.');
  }
  if (!req.body.dateTimePlanned) {
    validationMessages.push('geplande datum is vereist.');
  }
  if (!req.body.table) {
    validationMessages.push('tafel id is vereist.');
  }
  if (await matchOnTable(req.body.table, req.body.dateTimePlanned)) {
    validationMessages.push('Er is al een match bezig of gaat beginnen.');
  }
  if (validationMessages.length != 0) {
    return res.status(404).send({ message: validationMessages });
  }
  var naam = '';
  Team.findById(req.body.homeTeam)
    .then((ownTeam) => {
      Team.findById(req.body.awayTeam)
        .then((challengeTeam) => {
          naam = ownTeam.name + ' vs ' + challengeTeam.name;
          const match = new Match({
            name: naam,
            dateTimePlanned: req.body.dateTimePlanned,
            homeTeam: req.body.homeTeam,
            awayTeam: req.body.awayTeam,
            table: req.body.table,
          });

          // Save match in the database
          match
            .save(match)
            .then(async (data) => {
              return res.send(await returnMatch(data));
            })
            .catch((err) => {
              return res.status(500).send({
                message: err.message || 'Some error occurred while creating the match.',
              });
            });
        })
        .catch((err) => {
          return res.status(500).send({
            message: err.message || 'Het team dat je uitdaagt is niet gevonden.',
          });
        });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'U eigen team is niet gevonden',
      });
    });
};

exports.join = async (req, res) => {
  let validationMessages = [];
  if (!req.body.user) {
    validationMessages.push('user id is vereist.');
  }

  if (validationMessages.length != 0) {
    return res.status(404).send({ message: validationMessages });
  }
  const id = req.params.id;
  const user = req.body.user;

  Match.findById(id).then((match) => {
    if (!match) {
      return res.status(404).send({
        message: `Cannot update match with id=${id}. Because match was not found!`,
      });
    } else {
      var players = match.players;
      let found = players
        .filter((m) => m.user === user)
        .map((m) => {
          return m;
        });
      if (found.length == 0) {
        Team.findById(match.homeTeam).then((ownTeam) => {
          if (!ownTeam) {
            return res.status(404).send({
              message: `Cannot update match with id=${id}. Because HomeTeam was not found!`,
            });
          } else {
            found = ownTeam.participants.map((p) => {
              if (p.user === user) {
                return true;
              }
            });
            if (found.length == 0) {
              Team.findById(match.awayTeam).then((awayTeam) => {
                if (!awayTeam) {
                  return res.status(404).send({
                    message: `Cannot update match with id=${id}. Because AwayTeam was not found!`,
                  });
                } else {
                  found = awayTeam.participants.map((p) => {
                    if (p.user === user) {
                      return true;
                    }
                  });
                  if (found.length == 0) {
                    return res.status(500).send({
                      message:
                        err.message || 'de gebruiker is niet gevonden in de teams die deelenemen aan de wedstrijd.',
                    });
                  } else {
                    match.players.push({ user: user, team: awayTeam });
                    CheckRequirementsReachedAndSaveMatch(match, req, res);
                  }
                }
              });
            } else {
              match.players.push({ user: user, team: ownTeam });
              CheckRequirementsReachedAndSaveMatch(match, req, res);
            }
          }
        });
      } else {
        return res.status(500).send({
          message: 'de gebruiker neemt al deel aan de wedstrijd.',
        });
      }
    }
  });
};

CheckRequirementsReachedAndSaveMatch = async (match, req, res) => {
  const minNumberPlayersPerTeam = match.matchType.minNumberPlayersPerTeam;
  var ownTeamCount = 0;
  var awayTeamCount = 0;
  var errorParticipants = false;
  match.players.map((p) => {
    if (p.team.equals(match.homeTeam)) {
      ownTeamCount = ownTeamCount + 1;
    } else if (p.team.equals(match.awayTeam)) {
      awayTeamCount = awayTeamCount + 1;
    } else {
      errorParticipants = true;
    }
  });
  if (errorParticipants) {
    return res.status(500).send({
      message: 'Er is iemand die deelneemt aan de wedstrijd dat niet in het team van de wedstrijd zit.',
    });
  }
  if (ownTeamCount >= minNumberPlayersPerTeam && awayTeamCount >= awayTeamCount) {
    match.requirementsReached = true;
  }
  match
    .save(match)
    .then(async (data) => {
      return res.send(await returnMatch(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the match.',
      });
    });
};

exports.leave = async (req, res) => {
  const id = req.params.id;
  console.log('id : ' + id);
  Match.findById(id)
    .then(async (data) => {
      console.log('data : ' + data);
      if (!data) {
        return res.status(404).send({ message: 'Not found match with id ' + id });
      } else {
        console.log(data.dateTimeStart !== undefined);
        if (data.dateTimeStart !== undefined) {
          console.log('in if');
          let userid = await authJwt.getUserFromToken(req);
          console.log('userid : ' + userid);
          var players = data.players;
          console.log(players);
          let updatedPlayers = players
            .filter((m) => m.user === userid)
            .map((m) => {
              return m;
            });
          console.log(updatedPlayers);
          data.players = updatedPlayers;
          data
            .save(data)
            .then(async (data) => {
              console.log('saved');
              return res.send(await returnMatch(data));
            })
            .catch((err) => {
              return res.status(500).send({
                message: err.message || 'Some error occurred while creating the match.',
              });
            });
        }
      }
    })
    .catch((err) => {
      return res.status(500).send({ message: 'Error retrieving match with id=' + id });
    });
};

exports.start = async (req, res) => {
  const id = req.params.id;

  Match.findById(id)
    .then((data) => {
      data.dateTimeStart = new Date();
      data
        .save(data)
        .then(async (data) => {
          return res.send(await returnMatch(data));
        })
        .catch((err) => {
          return res.status(500).send({
            message: err.message || 'Some error occurred while creating the match.',
          });
        });
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};
