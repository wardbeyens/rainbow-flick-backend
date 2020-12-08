module.exports = (mongoose) => {
  const Team = mongoose.model(
    'Team',
    mongoose.Schema(
      {
        name: { type: String, required: true },
        location: { type: String, required: true },
        companyName: { type: String, required: true },
        imageURL: { type: String, required: true },
        captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        requestedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        locked: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

  return Team;
};
