module.exports = (mongoose) => {
  const Player = mongoose.model(
    'Player',
    mongoose.Schema(
      {
        user: {
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
          email: { type: String, required: true },
          dateOfBirth: { type: Date, required: true },
          imageURL: String,
          permissions: { type: [String] },
          password: { type: String, required: true, select: false },
        },
        teamID: Number,
      },
      { timestamps: true }
    )
  );

  return Player;
};
