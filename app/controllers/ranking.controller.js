const { model } = require('mongoose');
const { team, match } = require('../models');
const db = require('../models');
const Match = db.match;
const Score = db.score;
const Team = db.team;

queryMatchesTeam = async (team) => {
    return await Match.find({ $or: [{ homeTeam: team }, { awayTeam: team }] })
      .exec();
  };

exports.findAll = async (req, res) => {
  let teams;
  try {
    teams = await Team.find({});
    if (!teams) {
      return res.status(400).send({ message: 'No teams found' });
    } else {
        let scoresTeams=[]
        for(let i =0;i<teams.length;i++){
            let matches = await queryMatchesTeam(teams[i]._id)
            let score=0;
            for(let j =0;j<matches.length;j++){
                if(matches[j].homeTeam==teams[i]._id){
                    score=score + matches[j].homeTeamPoints;
                }else{
                    score=score + matches[j].awayTeamPoints;
                }
            }
            scoresTeams.push({team:teams[i]._id,score:score});
        }
    }
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving teams' });
  }
};
