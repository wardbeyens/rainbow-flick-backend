module.exports = mongoose => {
    const Comment = mongoose.model(
        "Comment",
        mongoose.Schema(
            {
                ArticleID: { type: String, required: true },
                UserID: { type: String, required: true },
                Username: { type: String, required: true },
                Comment: {type: String, required: true},
            },
            { timestamps: true }
        )
    );

    return Comment;
};