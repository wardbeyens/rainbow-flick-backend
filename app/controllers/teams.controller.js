const db = require('../models');
const Team = db.team;

returnUser = (data) => {
  return {
    id: data._id || data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    dateOfBirth: data.dateOfBirth,
    imageURL: data.imageURL,
  };
};

returnTeam = (data) => {
  return {
    result: {
      id: data._id || data.id,
      name: data.name,
      location: data.location,
      companyName: data.companyName,
      imageURL: data.imageURL,
      captain: returnUser(data.captain),
      participants: data.participants,
      requestedParticipants: data.requestedParticipants,
    },
  };
};

storeTeamInDatabase = (team, res) => {
  team
    .save(team)
    .then((d) => {
      d.populate({ path: 'captain', model: 'User' })
        .execPopulate()
        .then((data) => {
          return res.send(returnTeam(data));
        });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the team.',
      });
    });
};

exports.create = (req, res) => {
  // Create a user
  let team = new Team({
    name: req.body.name,
    location: req.body.location,
    companyName: req.body.companyName,
  });

  team.captain = req.authUser.id;

  if (req.body.imageURL) {
    team.imageURL = req.body.imageURL;
  } else {
    team.imageURL = 'https://rainbow-flick-backend-app.herokuapp.com/images/placeholder.png';
  }

  Team.find({
    name: req.body.name,
  }).then((response) => {
    if (response.length == 0) {
      storeTeamInDatabase(team, res);
    } else {
      return res.status(404).send({ message: `Already exists a Team with this name: ${team.name}` });
    }
  });
};
