const { team, match, table } = require('../models');
const db = require('../models');
const Match = db.match;
const Score = db.score;
const Team = db.team;
const Table = db.table;

// const Player = db.player;
const TeamController = require('./teams.controller');
const UserController = require('./user.controller');

const rewardScore = {
  won: 100,
  lost: 25,
};

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
    player.teamID = originalPlayer.team;

    returnPlayers.push(player);
  }
  return returnPlayers;
};
exports.returnMatchObject2 = async (data) => {
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
    homeTeamPoints: data.homeTeamPoints,
    awayTeamPoints: data.awayTeamPoints,
  };
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
    homeTeamPoints: data.homeTeamPoints,
    awayTeamPoints: data.awayTeamPoints,
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
  let validationMessages = await validateMatchFields(req, res);

  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
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
  let dateTimePlannedUperLimit = new Date();
  dateTimePlannedUperLimit.setDate(dateTimePlannedUperLimit.getDate() - 1);

  // Match.find().where("dateTimeStart").ne(null).where("dateTimePlanned").lt(dateTimePlannedUperLimit)
  Match.find({ $or: [{ dateTimeStart: { $ne: null } }, { dateTimePlanned: { $gte: dateTimePlannedUperLimit } }] })
    .then(async (data) => {
      return res.send(await returnMatches(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving matches.',
      });
    });
};
exports.findAllMatchesWithAuthUser = async (req, res) => {
  let teams = await TeamController.findMemberOfLocal(req.authUser._id);
  let dateTimePlannedUperLimit = new Date();
  dateTimePlannedUperLimit.setDate(dateTimePlannedUperLimit.getDate() - 1);
  // Match.find({ $or: [{ homeTeam: { $in: teams } }, { awayTeam: { $in: teams } }] })
  Match.find({
    $and: [
      { $or: [{ homeTeam: { $in: teams } }, { awayTeam: { $in: teams } }] },
      { $or: [{ dateTimeStart: { $ne: null } }, { dateTimePlanned: { $gte: dateTimePlannedUperLimit } }] },
    ],
  })
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
      if (!data) return res.status(400).send({ message: 'Not found match with id ' + id });
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
  //   return res.status(400).send({ messages: validationMessages });
  // }

  const id = req.params.id;

  Match.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
    .then(async (data) => {
      if (!data) {
        return res.status(400).send({
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
        return res.status(400).send({
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
  // console.log(req.body);

  let validationMessages = [];
  if (req.body.scoreHome == undefined) {
    validationMessages.push('ScoreHome is required.');
  }
  if (req.body.scoreAway == undefined) {
    validationMessages.push('ScoreAway is required.');
  }
  if (req.body.homeTeamScored == undefined) {
    validationMessages.push('HomeTeamScored is required.');
  }

  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
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
            return res.status(400).send({
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
isEmptyObject = (obj) => {
  return !Object.keys(obj).length;
};
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
userInHomeTeam = async (userid, teamid) => {
  let team = await Team.findById(teamid);
  return team.participants.includes(userid);
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
  if (!(await userInHomeTeam(req.authUser._id, req.body.homeTeam))) {
    validationMessages.push('de gebruiker zit niet in het homeTeam.');
  }
  if (req.body.awayTeam === req.body.homeTeam) {
    validationMessages.push('awayTeam and homeTeam zijn hetzelfde');
  }
  if (new Date() >= new Date(req.body.dateTimePlanned)) {
    validationMessages.push('de wedstrijd moet in de toekomst gepland zijn');
  }
  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
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
            players: [{ user: req.authUser._id, team: req.body.homeTeam }],
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
  if (!req.authUser._id) {
    validationMessages.push('user id is vereist.');
  }

  if (!req.body.teamID) {
    validationMessages.push('teamID IS VEREIST !!!!!!!!!! (dus met welk team doet deze user mee aan de wedstrijd)');
  }

  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
  }
  const id = req.params.id;
  const user = req.authUser._id;

  const teamid = req.body.teamID;

  Match.findById(id).then((match) => {
    if (!match) {
      return res.status(400).send({
        message: `Cannot update match with id=${id}. Because match was not found!`,
      });
    } else {
      var players = match.players;
      // console.log('players ' + players);
      // console.log('user ' + user);
      let found = players
        .filter((m) => m.user.equals(user))
        .map((m) => {
          return m;
        });
      if (found.length == 0) {
        if (teamid == match.homeTeam.toString()) {
          match.players.push({ user: user, team: teamid });
          CheckRequirementsReachedAndSaveMatch(match, req, res);
        } else if (teamid == match.awayTeam.toString()) {
          match.players.push({ user: user, team: teamid });
          CheckRequirementsReachedAndSaveMatch(match, req, res);
        } else {
          return res.status(500).send({
            message: err.message || 'de gebruiker is niet gevonden in de teams die deelenemen aan de wedstrijd.',
          });
        }
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
  } else {
    if (ownTeamCount >= minNumberPlayersPerTeam && awayTeamCount >= minNumberPlayersPerTeam) {
      match.requirementsReached = true;
    } else {
      match.requirementsReached = false;
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
  }
};

exports.leave = async (req, res) => {
  const id = req.params.id;
  console.log('id : ' + id);
  Match.findById(id)
    .then(async (data) => {
      console.log('data : ' + data);
      if (!data) {
        return res.status(400).send({ message: 'Not found match with id ' + id });
      } else {
        console.log(data.dateTimeStart);
        console.log(data.dateTimeStart === undefined);
        if (data.dateTimeStart === undefined) {
          console.log('in if');
          let userid = req.authUser._id;
          console.log('userid : ' + userid);
          var players = data.players;
          console.log(players);
          let updatedPlayers = players
            .filter((m) => m.user.equals(userid))
            .map((m) => {
              return m;
            });
          console.log(updatedPlayers);
          data.players = updatedPlayers;
          CheckRequirementsReachedAndSaveMatch(data, req, res);
          // data
          //   .save(data)
          //   .then(async (data) => {
          //     console.log('saved');
          //     return res.send(await returnMatch(data));
          //   })
          //   .catch((err) => {
          //     return res.status(500).send({
          //       message: err.message || 'Some error occurred while creating the match.',
          //     });
          //   });
        } else {
          return res.status(400).send({ message: 'can not leave match because it already started ' + id });
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
    .then(async (data) => {
      if (!data) {
        return res.status(400).send({ message: 'Not found match with id ' + id });
      } else {
        if (data.requirementsReached) {
          data.dateTimeStart = new Date();

          let updatedTable;
          try {
            updatedTable = await Table.findByIdAndUpdate(
              data.table,
              { inUse: false },
              { new: true, useFindAndModify: false }
            );
          } catch (err) {
            return res.status(500).send({
              message: 'Error updating with id=' + id,
            });
          }

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
        } else {
          return res.status(400).send({
            message: 'The requirements to start a match were not reached.',
          });
        }
      }
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};

queryMatchesLast30Days = async (team) => {
  let date = new Date();
  date.setDate(date.getDate() - 30);

  return await Match.find({ $or: [{ homeTeam: team }, { awayTeam: team }] })
    .where('dateTimeEnd')
    .gt(date)
    .exec();
};

exports.end = async (req, res) => {
  const id = req.params.id;
  const userid = req.authUser._id;

  Match.findById(id)
    .then(async (data) => {
      if (!data) {
        return res.status(400).send({ message: 'Not found match with id ' + id });
      } else {
        // console.log(data);
        if (!data.dateTimeEnd) {
          data.dateTimeEnd = new Date();

          let players = data.players;

          let player = players
            .filter((m) => m.user.equals(userid))
            .map((m) => {
              return m;
            });

          data.scoreSubmittedBy = player[0].team;

          let homeTeam = data.homeTeam;
          let awayTeam = data.awayTeam;

          let matchesHome = await queryMatchesLast30Days(homeTeam);
          let matchesAway = await queryMatchesLast30Days(awayTeam);

          let homeTeamWonMatches = matchesHome.filter((m) => {
            let score = m.score;

            if (score.length != 0) {
              let finalScore = score[score.length - 1];
              if (finalScore.scoreHome > finalScore.scoreAway) {
                return m.homeTeam == homeTeam;
              } else {
                return m.awayTeam == homeTeam;
              }
            } else {
              return false;
            }
          });

          let awayTeamWonMatches = matchesAway.filter((m) => {
            let score = m.score;

            if (score.length != 0) {
              let finalScore = score[score.length - 1];
              if (finalScore.scoreHome > finalScore.scoreAway) {
                return m.homeTeam == awayTeam;
              } else {
                return m.awayTeam == awayTeam;
              }
            } else {
              return false;
            }
          });

          let ratingHomeTeam = homeTeamWonMatches.length / matchesHome.length;
          let ratingAwayTeam = awayTeamWonMatches.length / matchesAway.length;

          let currentMatchsSCore = data.score[data.score.length - 1];
          let homeTeamWon;
          let awayTeamWon;
          if (currentMatchsSCore !== undefined) {
            if (currentMatchsSCore.scoreHome > currentMatchsSCore.scoreAway) {
              homeTeamWon = true;
              awayTeamWon = false;
            } else if (currentMatchsSCore.scoreAway > currentMatchsSCore.scoreHome) {
              awayTeamWon = true;
              homeTeamWon = false;
            } else {
              awayTeamWon = false;
              homeTeamWon = false;
            }

            baseScoreHome = homeTeamWon ? rewardScore.won : rewardScore.lost;
            baseScoreAway = awayTeamWon ? rewardScore.won : rewardScore.lost;

            if (Number.isNaN(ratingHomeTeam)) {
              ratingHomeTeam = 0.5;
            }
            if (Number.isNaN(ratingAwayTeam)) {
              ratingAwayTeam = 0.5;
            }
            if (matchesHome.length == 0) {
              matchesHome.push({ name: 'machesHomeFiller' });
            }
            if (matchesAway.length == 0) {
              matchesAway.push({ name: 'matchesAwayFiller' });
            }

            let pointsEarnedHome = (1 + ratingAwayTeam) * baseScoreHome * (matchesHome.length * 0.01);
            let pointsEarnedAway = (1 + ratingHomeTeam) * baseScoreAway * (matchesAway.length * 0.01);

            data.homeTeamPoints = pointsEarnedHome;
            data.awayTeamPoints = pointsEarnedAway;
          }

          let updatedTable;
          try {
            updatedTable = await Table.findByIdAndUpdate(
              data.table,
              { inUse: false },
              { new: true, useFindAndModify: false }
            );
          } catch (err) {
            return res.status(500).send({
              message: 'Error updating with id=' + id,
            });
          }
          if (!updatedTable) {
            return res.status(400).send({
              message: `Cannot update table with id=${data.table}.`,
            });
          } else {
            data
              .save(data)
              .then(async (data) => {
                return res.send(await returnMatch(data));
              })
              .catch((err) => {
                return res.status(500).send({
                  message: err.message || 'Some error occurred while ending the match.',
                });
              });
          }
        } else {
          return res.status(400).send({ message: 'Match already ended with id ' + id });
        }
      }
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error updating match with id=' + id,
      });
    });
};

exports.validateMatch = async (req, res) => {
  const id = req.params.id;
  let userid = req.authUser._id;

  Match.findById(id)
    .then(async (data) => {
      // console.log(data);
      if (!data) {
        return res.status(400).send({ message: 'Not found match with id ' + id });
      } else {
        if (data.dateTimeEnd !== undefined && data.scoreValidated !== true) {
          console.log('datum');
          console.log('userID : ' + userid);
          let players = data.players;
          console.log('players : ' + players);
          let player = players
            .filter((m) => m.user.equals(userid))
            .map((m) => {
              return m;
            });
          if (!player[0].team.equals(data.scoreSubmittedBy)) {
            data.scoreValidated = true;
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
          } else {
            return res.status(400).send({
              message:
                'can not validate because the user is not from the opposite team that submitted the score for this match with id: ' +
                id,
            });
          }
        } else {
          return res.status(400).send({ message: 'match cannot be validated : ' + id });
        }
      }
    })
    .catch((err) => {
      return res.status(500).send({
        message: 'Error validating score for match with id=' + id,
      });
    });
};
