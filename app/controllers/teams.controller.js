const { response } = require('express');
const db = require('../models');
const Team = db.team;
const User = db.users;

returnUser = async (id) => {
  const data = await User.findById(id);
  return {
    id: data._id || data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    dateOfBirth: data.dateOfBirth,
    imageURL: data.imageURL,
  };
};

returnTeam = async (data) => {
  return {
    result: {
      id: data._id || data.id,
      name: data.name,
      location: data.location,
      companyName: data.companyName,
      imageURL: data.imageURL,
      captain: await returnUser(data.captain),
      participants: data.participants,
      requestedParticipants: data.requestedParticipants,
    },
  };
};

returnTeams = async (d) => {
  var formattedTeams = [];
  for (let index = 0; index < d.length; index++) {
    let data = d[index];
    let userData = await returnUser(data.captain);
    let team = {
      id: data._id || data.id,
      name: data.name,
      location: data.location,
      companyName: data.companyName,
      imageURL: data.imageURL,
      captain: userData,
      participants: data.participants,
      requestedParticipants: data.requestedParticipants,
    };
    formattedTeams.push(team);
  }

  return formattedTeams;
};

storeTeamInDatabase = async (team, res) => {
  try {
    let newTeam = await team.save(team);
    let newTeamFormatted = await returnTeam(newTeam);
    return res.send(newTeamFormatted);
  } catch (err) {
    return res.status(500).send({
      message: err.message || 'Some error occurred while creating the team.',
    });
  }
};

exports.create = async (req, res) => {
  // Create a user
  let team = new Team({
    name: req.body.name,
    location: req.body.location,
    companyName: req.body.companyName,
    captain: req.authUser.id,
  });

  if (req.body.imageURL) {
    team.imageURL = req.body.imageURL;
  } else {
    team.imageURL = 'https://rainbow-flick-backend-app.herokuapp.com/images/placeholder.png';
  }

  let response;
  try {
    response = await Team.find({
      name: req.body.name,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  if (response.length !== 0) {
    return res.status(404).send({ message: `Already exists a Team with this name: ${team.name}` });
  } else {
    storeTeamInDatabase(team, res);
  }
};

exports.findAll = async (req, res) => {
  let response;
  try {
    response = await Team.find({});
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving teams' });
  }
  if (!response) return res.status(404).send({ message: 'No teams found' });

  return res.send(await returnTeams(response));
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  let response;
  try {
    response = await Team.findById(id);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving team with id: ' + id });
  }
  if (!response) return res.status(404).send({ message: 'Not found team with id ' + id });

  return res.send(await returnTeam(response));
};

exports.findOneByName = async (req, res) => {
  const name = req.query.name;
  let response;
  try {
    response = await Team.find({ name: name });
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving team with name: ' + name });
  }
  if (!response) return res.status(404).send({ message: 'Not found team with name ' + name });
  return res.send(await returnTeam(response[0]));
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  let response;
  try {
    response = await Team.findByIdAndRemove(id);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error deleting team with id: ' + id });
  }
  if (!response)
    return res.status(404).send({
      message: `Cannot delete user with id=${id}. Maybe user was not found!`,
    });
  return res.send(await returnTeam(response[0]));

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot delete user with id=${id}. Maybe user was not found!`,
        });
      } else {
        return res.send({
          message: 'User was deleted successfully!',
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({ message: err.message || 'Could not delete user with id=' + id });
    });
};
