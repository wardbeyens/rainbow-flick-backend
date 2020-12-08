const Player = require('./player.model');
const Team = require('./team.model');
const Table = require('./table.model');
const MatchType = require('./../const/matchType');
const Score = require('./score.model');

module.exports = (mongoose) => {
  const Match = mongoose.model(
    'Match',
    mongoose.Schema(
      {
        name: { type: String, required: true },
        dateTimePlanned: { type: Date, required: true },
        dateTimeStart: Date,
        dateTimeEnd: Date,
        homeTeam: { type: Team, required: true },
        awayTeam: { type: Team, required: true },
        players: { type: [Player] },
        score: { type: [Score] },
        table: { Table, required: true },
        scoreSubmittedBy: String,
        scoreValidated: Boolean,
        requirementsReached: Boolean,
        matchType: MatchType,
      },
      { timestamps: true }
    )
  );

  return Match;
};
