const db = require("../models");
const Article = db.articles;
const Tag = db.tags;
const articleStatusIDs = require('../const/ArticleStatusIDs')

// Create and Save a new article
exports.create = (req, res) => {
  // Validate request
  if (!req.body.Title) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  console.log(req.files);
  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get("host") + "/images/" + file.filename)
  const articleStatusID = (typeof req.body.RequestReview == "undefined" || req.body.RequestReview == "false") ? {Name: 'draft', id:articleStatusIDs.draft} : {Name: 'In review', id:articleStatusIDs.inReview}

  Tag.find({ '_id': { $in: req.body.TagIDs } }).select('_id Name').then((tags) => {
    const article = new Article({
      Title: req.body.Title,
      SubTitle: req.body.SubTitle,
      ShortSummary: req.body.ShortSummary,
      Body: req.body.Body,
      Tags: tags,
      ImagePaths: imageFilePaths,
      AuthorID: req.authUser._id,
      AuthorFullName: `${req.authUser.FirstName} ${req.authUser.LastName}`,
      ArticleStatus: articleStatusID
    });

    // Save article in the database
    article
      .save(article)
      .then(data => {
        data = data.toObject();
        delete data.AuthorID;
        delete data.LikedBy;
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the article."
        });
      });
  }
  );
};

// Retrieve all articles from the database.
exports.findAll = (req, res) => {
  Article.aggregate([
    { $match: { 'ArticleStatus.id': `${articleStatusIDs.published}` } },
    { $unset: ['LikedBy', 'ArticleStatus', 'AuthorID', 'Body', 'updatedAt' ] }])
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving articles."
      });
    });
};

// Find a single article with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Article.findById(id).select('Body LikedBy _id')
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found article with id " + id });
      else{
        data = data.toObject();
        let likedByUser = false
        if(typeof req.authUser != "undefined"){
          likedByUser = data.LikedBy.includes(req.authUser._id.toString());
        }
        data.LikedByUser = likedByUser
        data.NumberLikes = data.LikedBy.length;
        delete data.LikedBy;
        console.log(data.LikedByUser)
        res.send(data);
      } 
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving article with id=" + id });
    });
};

// Update a article by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Article.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update article with id=${id}. Maybe article was not found!`
        });
      } else res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating article with id=" + id
      });
    });
};

// Delete a article with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Article.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete article with id=${id}. Maybe article was not found!` //Article is found, so not relevant
        });
      } else {
        res.send({
          message: "article was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete article with id=" + id
      });
    });
};

exports.toggleLike = (req, res) => {
  Article.findOne({ _id: req.params.id })
    .then(article => {
      if (!article.LikedBy.includes(req.authUser._id)) {
        article.LikedBy.push(req.authUser._id);
        article.save().then((newArticle) => {
          res.send({
            liked: true,
            numberLikes: newArticle.LikedBy.length,
            message: "article was liked successfully!"
          })
        });
      } else {
        article.LikedBy = article.LikedBy.filter(elm => elm != req.authUser._id);
        article.save()
          .then((newArticle) =>
            res.send({
              liked: false,
              numberLikes: newArticle.LikedBy.length,
              message: "article was disliked successfully!"
            })
          );
      }
    })
}

exports.publish = (req, res) => {
  Article.findByIdAndUpdate({ _id: req.params.id }, { $set: { ArticleStatusID: articleStatusIDs.published } })
    .then((data) => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not publish article with id=" + id
      });
    });
}

exports.findUnpublishedArticles = (req, res) => {
  Article.find({ 'ArticleStatus.id' : [articleStatusIDs.draft, articleStatusIDs.inReview], AuthorID: req.authUser._id})
  .select('-AuthorID -AuthorFullName -LikedBy')
  .then((data) => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({message: "Er is iets foutgelopen bij het laden van artikels voor gebruiker" + req.authUser._id})
  })
}

exports.findArticlesInReview = (req, res) => {
  Article.find({ 'ArticleStatus.id' : articleStatusIDs.inReview})
  .select('-LikedBy')
  .then((data) => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({message: "Er is iets foutgelopen bij het laden"})
  })
}

exports.setStatusToInReview = (req, res) => {
  const newArticleStatus = {Name: "In review", id: articleStatusIDs.inReview }
  Article.findOneAndUpdate(
    {_id: req.params.id, AuthorID: req.authUser._id, 'ArticleStatus.id': articleStatusIDs.draft}, 
    {$set: {ArticleStatus: newArticleStatus }}, 
    { new: true, useFindAndModify: false },
    (err, data) => {
      if(err){
        res.status(500).send({
          message: "Error updating article with id=" + req.params.id
        });
      }
      if (!data) {
        res.status(404).send({
          message: `Cannot update article with id: ${req.params.id}.`
        });
      } 
      else{
        data = data.toObject();
        res.status(200).send(data.ArticleStatus);
      }
    });
}

exports.setStatusToPublished = (req, res) => {
  const newArticleStatus = {Name: "Published", id: articleStatusIDs.published }
  Article.findOneAndUpdate(
    {_id: req.params.id, 'ArticleStatus.id': articleStatusIDs.inReview}, 
    {$set: {ArticleStatus: newArticleStatus }}, 
    { new: true, useFindAndModify: false },
    (err, data) => {
      if(err){
        res.status(500).send({
          message: "Error updating article with id=" + req.params.id
        });
      }
      if (!data) {
        res.status(404).send({
          message: `Cannot update article with id: ${req.params.id}.`
        });
      } 
      else{
        data = data.toObject();
        res.status(200).send(data.ArticleStatus);
      }
    });
}



