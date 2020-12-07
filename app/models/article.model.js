const articleStatusIDs = require('../const/ArticleStatusIDs');

module.exports = mongoose => {
  const Article = mongoose.model(
    "Article",
    mongoose.Schema(
      {
        Title: String,
        SubTitle: String,
        ShortSummary: String,
        Body: String,
        Tags: {type: Array},
        ImagePaths: [String],
        LikedBy: { type: [String] },
        AuthorID: String,
        AuthorFullName: String,
        ArticleStatus: {id : String, Name: String }
      },
      { timestamps: true }
    )
  );
  return Article;
};