const User = require('./user.model');

module.exports = (mongoose) => {
  const Team = mongoose.model(
    'Team',
    mongoose.Schema(
      {
        name: { type: String, required: true },
        location: { type: String, required: true },
        companyName: { type: String, required: true },
        imageURL: { type: String, required: true },
        captain: { type: User, required: true },
        participants: [User],
        requestedParticipants: [User],
        locked: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

  return Team;
};
