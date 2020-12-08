module.exports = (mongoose) => {
  const Player = mongoose.model(
    'Player',
    mongoose.Schema(
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        teamID: { type: mongoose.Schema.Types.ObjectId, ref: 'team' },
      },
      { timestamps: true }
    )
  );

  return Player;
};
