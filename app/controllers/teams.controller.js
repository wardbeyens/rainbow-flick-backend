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
    imageURL: data.imageURL,
  };
};

returnParticipants = async (originalParticipantsList) => {
  if (!originalParticipantsList) return [];
  let participantsList = [];
  for (let index = 0; index < originalParticipantsList.length; index++) {
    let id = originalParticipantsList[index];
    let userData = await returnUser(id);
    participantsList.push(userData);
  }
  return participantsList;
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
      participants: await returnParticipants(data.participants),
      requestedParticipants: await returnParticipants(data.requestedParticipants),
    },
  };
};

returnTeamLocal = async (data) => {
  return {
    id: data._id || data.id,
    name: data.name,
    location: data.location,
    companyName: data.companyName,
    imageURL: data.imageURL,
    captain: await returnUser(data.captain),
    participants: await returnParticipants(data.participants),
    requestedParticipants: await returnParticipants(data.requestedParticipants),
  };
};

returnTeams = async (d) => {
  var formattedTeams = [];
  for (let index = 0; index < d.length; index++) {
    let data = d[index];
    // let userData = await returnUser(data.captain);
    let team = {
      id: data._id || data.id,
      name: data.name,
      location: data.location,
      companyName: data.companyName,
      imageURL: data.imageURL,
      // captain: data.captain,
      participants: data.participants,
    };
    formattedTeams.push(team);
  }

  return { results: formattedTeams };
};

exports.create = async (req, res) => {
  let team = new Team({
    name: req.body.name,
    location: req.body.location,
    companyName: req.body.companyName,
    captain: req.authUser.id,
  });

  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);

  if (imageFilePaths[0]) {
    team.imageURL = imageFilePaths[0];
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

  team.participants = [req.authUser.id];

  if (response.length !== 0) {
    return res.status(400).send({ message: `Already exists a Team with this name: ${team.name}` });
  } else {
    try {
      let newTeam = await team.save(team);
      let newTeamFormatted = await returnTeam(newTeam);
      return res.send(newTeamFormatted);
    } catch (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the team.',
      });
    }
  }
};

exports.findAll = async (req, res) => {
  let response;
  try {
    response = await Team.find({});
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving teams' });
  }
  if (!response) return res.status(400).send({ message: 'No teams found' });

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
  if (!response) return res.status(400).send({ message: 'Not found team with id ' + id });

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
  if (response.length == 0) return res.status(400).send({ message: 'Not found team with name ' + name });
  return res.send(await returnTeam(response[0]));
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  let response;
  try {
    response = await Team.findByIdAndRemove(id);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Could not delete team with id=' + id });
  }
  if (!response)
    return res.status(400).send({
      message: `Cannot delete team with id=${id}. Maybe team was not found!`,
    });
  return res.send({
    message: 'Team was deleted successfully!',
  });
};

exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const id = req.params.id;

  let response;
  try {
    response = await Team.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false });
  } catch (err) {
    return res.status(500).send({
      message: 'Error updating team with id=' + id,
    });
  }
  let teamFormatted = await returnTeam(response);
  return res.send(teamFormatted);
};

exports.join = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const teamID = req.params.id;

  const userID = req.body.id;

  let response;
  try {
    response = await Team.findById(teamID);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving team with id: ' + teamID });
  }
  if (!response) return res.status(400).send({ message: 'Not found team with id ' + teamID });

  let participants = response.participants;
  let requestedParticipants = response.requestedParticipants;

  if (participants.includes(userID)) {
    return res.status(400).send({
      message: 'Je bent al lid van dit team, no worries.',
    });
  } else if (requestedParticipants.includes(userID)) {
    return res.status(400).send({
      message: 'Je hebt al een aanvraag gestuurd om je bij dit team aan te sluiten.',
    });
  } else {
    requestedParticipants.push(userID);
  }

  try {
    response = await Team.findByIdAndUpdate(
      teamID,
      { requestedParticipants: requestedParticipants },
      { new: true, useFindAndModify: false }
    );
  } catch (err) {
    return res.status(500).send({
      message: 'Error updating team with id=' + id,
    });
  }
  let teamFormatted = await returnTeam(response);
  return res.send(teamFormatted);
};

exports.leave = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const teamID = req.params.id;

  const userID = req.body.id;

  let response;
  try {
    response = await Team.findById(teamID);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving team with id: ' + teamID });
  }
  if (!response) return res.status(400).send({ message: 'Not found team with id ' + teamID });

  let participants = response.participants;
  let requestedParticipants = response.requestedParticipants;

  if (response.captain._id == userID) {
    res.status(400).send({ message: 'Damnit seg laat u team is niet in de steek captain!' });
  }

  if (requestedParticipants.includes(userID) || participants.includes(userID)) {
    requestedParticipants = requestedParticipants.filter((value, index, arr) => {
      return value.toString() !== userID.toString();
    });
    participants = participants.filter((value, index, arr) => {
      return value.toString() !== userID.toString();
    });
  } else {
    return res.status(400).send({
      message: 'Je bent geen lid van dit team, no worries.',
    });
  }

  try {
    response = await Team.findByIdAndUpdate(
      teamID,
      { requestedParticipants: requestedParticipants, participants: participants },
      { new: true, useFindAndModify: false }
    );
  } catch (err) {
    return res.status(500).send({
      message: 'Error updating team with id=' + id,
    });
  }
  let teamFormatted = {};
  try {
    teamFormatted = await returnTeam(response);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error idk why zoek het zelf maar uit' });
  }
  return res.send(teamFormatted);
};

exports.accept = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const teamID = req.params.id;

  const userID = req.body.id;

  let response;
  try {
    response = await Team.findById(teamID);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving team with id: ' + teamID });
  }
  if (!response) return res.status(400).send({ message: 'Not found team with id ' + teamID });

  let participants = response.participants;
  let requestedParticipants = response.requestedParticipants;

  if (participants.includes(userID)) {
    return res.status(400).send({
      message: 'Je bent al lid van dit team, no worries.',
    });
  } else {
    participants.push(userID);
    requestedParticipants = requestedParticipants.filter((value, index, arr) => {
      return value.toString() !== userID.toString();
    });
  }

  // een restrictie die we kunnen toevoegen maar wrs nu te veel is
  /*   if (requestedParticipants.includes(userID)) {
    participants.push(userID);
  } else {
    return res.status(400).send({
      message: 'De gebruiker moet zich eerst aanmelden voor dit team vooralleer je hem kan toevoegen .',
    });
  } */

  try {
    response = await Team.findByIdAndUpdate(
      teamID,
      { requestedParticipants: requestedParticipants, participants: participants },
      { new: true, useFindAndModify: false }
    );
  } catch (err) {
    return res.status(500).send({
      message: 'Error updating team with id=' + id,
    });
  }
  let teamFormatted = await returnTeam(response);
  return res.send(teamFormatted);
};

exports.findOneLocal = async (id) => {
  let response;
  try {
    response = await Team.findById(id);
  } catch (err) {
    return {};
  }
  return returnTeamLocal(response);
};

exports.findMemberOf = async (req, res) => {
  let id = req.body.id;
  let response;
  try {
    response = await Team.find({ participants: id });
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving teams' });
  }

  return res.send(await returnTeams(response));
};
