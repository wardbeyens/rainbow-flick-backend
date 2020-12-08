module.exports = (mongoose) => {
  const User = mongoose.model(
    'User',
    mongoose.Schema(
      {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        imageURL: String,
        permissions: { type: [String] },
        password: { type: String, required: true, select: false },
      },
      { timestamps: true }
    )
  );

  return User;
};
