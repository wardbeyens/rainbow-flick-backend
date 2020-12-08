const dbConfig = require('../config/db.config.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.users = require('./user.model.js')(mongoose);
db.table = require('./table.model.js')(mongoose);
// db.articles = require("./article.model.js")(mongoose);
// db.roles = require("./role.model.js")(mongoose);
// db.tags = require("./tag.model.js")(mongoose);
// db.articlestatuses = require("./articlestatus.model.js")(mongoose);
// db.comments = require('./comment.model.js')(mongoose);

module.exports = db;
