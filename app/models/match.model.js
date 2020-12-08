const Player = require('./player.model');
const Team = require('./team.model');
const Table = require('./table.model');
const MatchType = require('./../const/matchType');

module.exports = mongoose => {
    const Match = mongoose.model(
      "Match",
      mongoose.Schema(
        {
          Name: String,
          dateTimePlanned:  { type: Date, required: truee },
          dateTimeStart:  Date,
          dateTimeEnd:  Date,
          homeTeam:  { type: Team, required: true },
          awayTeam:  { type: Team, required: true },
          players: { type: [Player]},
          scoreHome : Number,
          scoreAway : Number,
          table : Table,
          scoreSubmittedBy : String,
          scoreValidated:Boolean,
          requirementsReached:Boolean,
          matchType:MatchType
        },
        { timestamps: true }
      )
    );
  
    return Match;
  };