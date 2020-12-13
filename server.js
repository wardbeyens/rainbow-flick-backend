const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./app/models');
const path = require('path');

const app = express();
//http://localhost:8081
var corsOptions = {
  origin: '*',
};

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {})
  .catch((err) => {
    process.exit();
  });

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  // This check makes sure this is a JSON parsing issue, but it might be
  // coming from any middleware, not just body-parser:
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // console.error(err);
    //
    //
    return res.sendStatus(400); // Bad request
  }
  next();
});
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/images', express.static(path.join('app/files/images')));

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'api loaded succesfully yeah :)' });
});

// First User, other tables may depend on this table
require('./app/routes/user.routes')(app);
require('./app/routes/table.routes')(app);
require('./app/routes/team.routes')(app);
require('./app/routes/match.routes')(app);
require('./app/routes/ranking.routes')(app);
require('./app/routes/image.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {});
