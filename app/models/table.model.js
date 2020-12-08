module.exports = (mongoose) => {
  const Table = mongoose.model(
    'Table',
    mongoose.Schema(
      {
        name: { type: String, required: true },
        location: { type: String, required: true },
        imageUrl: String,
        contactName: String,
        contactPhone: String,
        description: { type: String, required: true },
        inUse: Boolean,
      },
      { timestamps: true }
    )
  );

  return Table;
};
