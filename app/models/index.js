const dbConfig = require('../config/db.config.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.users = require('./user.model.js')(mongoose);
db.team = require('./team.model.js')(mongoose);
db.table = require('./table.model.js')(mongoose);
db.player = require('./player.model.js')(mongoose);
db.score = require('./score.model.js')(mongoose);
db.match = require('./match.model.js')(mongoose);
module.exports = db;
