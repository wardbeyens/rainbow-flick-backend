const { model } = require('mongoose');
const { team, match } = require('../models');
const db = require('../models');
const Match = db.match;
const Score = db.score;
const Team = db.team;

queryMatchesTeam = async (team) => {
  return await Match.find({ $or: [{ homeTeam: team }, { awayTeam: team }] }).exec();
};

compare = (a, b) => {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
};

exports.getRankingTeams = async (req, res) => {
  let teams;
  try {
    teams = await Team.find({});
    if (!teams) {
      return res.status(400).send({ message: 'No teams found' });
    } else {
      let scoresTeams = [];
      for (let i = 0; i < teams.length; i++) {
        let matches = await queryMatchesTeam(teams[i]._id);
        let score = 0;
        for (let j = 0; j < matches.length; j++) {
          if (matches[j].homeTeam.equals(teams[i]._id)) {
            if (!isNaN(matches[j].homeTeamPoints)) {
              score = score + Number(matches[j].homeTeamPoints);
            }
          } else {
            if (!isNaN(matches[j].awayTeamPoints)) {
              score = score + Number(matches[j].awayTeamPoints);
            }
          }
        }
        scoresTeams.push({
          teamId: teams[i]._id,
          teamName: teams[i].name,
          teamLocation: teams[i].location,
          teamImageUrl: teams[i].imageURL,
          teamCompanyName: teams[i].companyName,
          score: score,
        });
      }
      scoresTeams.sort(compare);
      return res.send({ results: await scoresTeams });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving teams' });
  }
};
