module.exports = (mongoose) => {
  const Score = mongoose.model(
    'Score',
    mongoose.Schema(
      {
        scoreHome: { type: Number, required: true },
        scoreAway: { type: Number, required: true },
        whenScored: { type: Number, required: true },
        homeTeamScored: { type: Boolean, required: true },
      },
      { timestamps: true }
    )
  );

  return Player;
};
