module.exports = mongoose => {
  const User = mongoose.model(
    "User",
    mongoose.Schema(
      {
        FirstName: String,
        LastName: String,
        Email: String,
        Username: {type: String, required: true},
        Password: {type: String, required: true, select: false},
        RoleID: {type: String, required: true}
      },
      { timestamps: true }
    )
  );

  return User;
};