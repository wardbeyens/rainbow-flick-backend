// const Player = require('./player.model');
// const Table = require('./table.model');
// const MatchType = require('./../const/matchType');
// const Score = require('./score.model');
// const Team = require('./team.model');

module.exports = (mongoose) => {
  const Match = mongoose.model(
    'Match',
    mongoose.Schema(
      {
        name: { type: String, required: true },
        dateTimePlanned: { type: Date, required: true },
        dateTimeStart: Date,
        dateTimeEnd: Date,
        homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        players: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            team: { type: mongoose.Schema.Types.ObjectId, ref: 'team' },
          },
        ],
        score: [
          {
            scoreHome: { type: Number, required: true },
            scoreAway: { type: Number, required: true },
            whenScored: { type: Number, required: true },
            homeTeamScored: { type: Boolean, required: true },
          },
        ],
        table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
        scoreSubmittedBy: String,
        scoreValidated: Boolean,
        requirementsReached: Boolean,
        matchType: { name: String, minNumberPlayersPerTeam: Number },
      },
      { timestamps: true }
    )
  );

  return Match;
};