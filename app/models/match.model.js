const matchType = require('../const/matchType');
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
        matchType: { type: { name: String, minNumberPlayersPerTeam: Number }, default: matchType.fun },
        homeTeamPoints: String,
        awayTeamPoints: String,
      },
      { timestamps: true }
    )
  );

  return Match;
};
