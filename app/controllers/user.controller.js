const config = require('../config/auth.config');
const db = require('../models');
const User = db.users;
const { adminPermissions, userPermissions } = require('../const/permissions');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

//helper function to validate userfields
validateUserFields = (req, isRequired) => {
  // Validate request
  validationMessages = [];

  //First Name
  if (!req.body.firstName && isRequired) {
    validationMessages.push('FirstName is required.');
  } else if (req.body.firstName) {
    if (req.body.firstName.length < 2) {
      validationMessages.push('FirstName must be at least 2 characters');
    } else if (req.body.firstName.length > 24) {
      validationMessages.push('FirstName can not be longer than 24 characters');
    }
  }

  //Last Name
  if (!req.body.lastName && isRequired) {
    validationMessages.push('LastName is required.');
  } else if (req.body.lastName) {
    if (req.body.lastName.length < 3) {
      validationMessages.push('LastName must be at least 3 characters');
    } else if (req.body.lastName.length > 56) {
      validationMessages.push('LastName can not be longer than 56 characters');
    }
  }

  // Email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!req.body.email && isRequired) {
    validationMessages.push('Email is required.');
  } else if (req.body.email) {
    if (!emailRegex.test(req.body.email)) {
      validationMessages.push(`${req.body.email} is not a valid email`);
    }
  }

  //Last Name
  if (!req.body.password && isRequired) {
    validationMessages.push('Password is required.');
  } else if (req.body.password) {
    if (req.body.password.length < 3) {
      validationMessages.push('Password must be at least 3 characters');
    } else if (req.body.password.length > 128) {
      validationMessages.push('Password can not be longer than 128 characters');
    }
  }

  //Last Name
  if (!req.body.dateOfBirth && isRequired) {
    validationMessages.push('Birthday is required.');
  } else if (req.body.dateOfBirth) {
    dateOfBirthCastedToDate = new Date(req.body.dateOfBirth);
    if (isNaN(dateOfBirthCastedToDate.getTime())) {
      // d.valueOf() could also work
      validationMessages.push('Birthday must be a date');
    }
  }

  return validationMessages;
};

//helper function to store user in db
storeUserInDatabase = (user, res) => {
  user
    .save(user)
    .then((data) => {
      return res.send(returnUserWithToken(data));
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the user.',
      });
    });
};

//helper function to create a token
createToken = (user) => {
  return jwt.sign({ id: user._id || user.id, permissions: user.permissions }, config.secret, {
    expiresIn: 86400, // 24 hours
  });
};

//helper function to return userObject
returnUserWithToken = (data) => {
  return {
    result: {
      id: data._id || data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      imageURL: data.imageURL,
      permissions: data.permissions,
      accessToken: createToken(data),
    },
  };
};

//helper function to return userObject
returnUserLimited = (data) => {
  return {
    result: {
      id: data._id || data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      imageURL: data.imageURL,
      permissions: data.permissions,
    },
  };
};

returnUserLimitedLocal = (data) => {
  return {
    id: data._id || data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    // dateOfBirth: data.dateOfBirth,
    // imageURL: data.imageURL,
    // permissions: data.permissions,
  };
};

returnUsers = (data) => {
  return {
    results: data.map((data) => ({
      id: data._id || data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      imageURL: data.imageURL,
      permissions: data.permissions,
    })),
  };
};

// Create and Save a new user
exports.create = (req, res) => {
  console.log(req.body);

  let validationMessages = validateUserFields(req, true);

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
  }

  // Create a user
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    dateOfBirth: new Date(req.body.dateOfBirth),
    password: bcrypt.hashSync(req.body.password, 8),
  });

  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);

  if (imageFilePaths[0]) {
    user.imageURL = imageFilePaths[0];
  } else {
    user.imageURL = 'https://rainbow-flick-backend-app.herokuapp.com/images/placeholder.png';
  }

  user.permissions = [...userPermissions];

  User.find({
    email: req.body.email,
  }).then((response) => {
    if (response.length == 0) {
      storeUserInDatabase(user, res);
    } else {
      return res.status(400).send({ message: `Already exists an account with this email: ${user.email}` });
    }
  });
};

exports.authenticate = (req, res) => {
  let validationMessages = [];

  // Email validation
  if (!req.body.email) {
    validationMessages.push('Email is required.');
  }

  //Last Name
  if (!req.body.password) {
    validationMessages.push('Password is required.');
  }

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
  }

  User.findOne({
    email: req.body.email,
  })
    .select('+password')
    .exec((err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      if (!user) {
        return res.status(200).send({ error: 'Er is geen gebruiker gevonden met e-mailadres.' });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.send({
          error: 'Hey bruh, wachtwoord vergeten? Want het klopt niet eh man!',
        });
      }

      return res.status(200).send(returnUserWithToken(user));
    });
};

// Find a single user with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data) return res.status(400).send({ message: 'Not found user with id ' + id });
      else return res.send(returnUserLimited(data));
    })
    .catch((err) => {
      return res.status(500).send({ message: 'Error retrieving user with id=' + id });
    });
};

// Update a user
exports.update = async (req, res) => {
  let alreadyExists = false;
  let validationMessages = validateUserFields(req, false);
  // If request not valid, return messages
  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
  }

  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);

  let user = req.body;

  if (imageFilePaths[0]) {
    user.imageURL = imageFilePaths[0];
  }

  const id = req.params.id;

  if (user.email) {
    let response = await User.find({
      email: user.email,
    });
    for (let index = 0; index < response.length; index++) {
      const element = response[index];
      if (id.toString() !== element._id.toString()) {
        alreadyExists = true;
      }
    }
  }
  if (alreadyExists) {
    return res.status(400).send({ message: `Already exists an account with this email: ${req.body.email}` });
  } else {
    User.findByIdAndUpdate(id, req.body, { new: true, useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(400).send({
            message: `Cannot update user with id=${id}. Maybe user was not found!`,
          });
        } else return res.send(returnUserWithToken(data));
      })
      .catch((err) => {
        return res.status(500).send({
          message: 'Error updating with id=' + id,
        });
      });
  }
};

// Find all users
exports.findAll = (req, res) => {
  User.find({})
    .then((users) => {
      if (!users) return res.status(400).send({ message: 'No users found' });
      return res.send(returnUsers(users));
    })
    .catch((err) => {
      return res.status(500).send({ message: err.message || 'Error retrieving users' });
    });
};

// Delete a user with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  if (req.authUser._id == id) {
    return res.status(400).send({ message: "Can't delete own account" });
  }

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        return res.status(400).send({
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

// Creates an admin
exports.createAdmin = (req, res) => {
  console.log(req.body);
  let validationMessages = validateUserFields(req, true);

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    return res.status(400).send({ messages: validationMessages });
  }
  // Create a user
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    dateOfBirth: new Date(req.body.dateOfBirth),
    password: bcrypt.hashSync(req.body.password, 8),
  });

  const imageFilePaths = req.files.map((file) => req.protocol + '://' + req.get('host') + '/images/' + file.filename);

  if (imageFilePaths[0]) {
    user.imageURL = imageFilePaths[0];
  } else {
    user.imageURL = 'https://rainbow-flick-backend-app.herokuapp.com/images/placeholder.png';
  }

  user.permissions = [...adminPermissions];

  User.find({
    email: req.body.email,
  }).then((response) => {
    if (response.length == 0) {
      storeUserInDatabase(user, res);
    } else {
      return res.status(400).send({ message: `Already exists an account with this email: ${user.email}` });
    }
  });
};

exports.findOneLocal = async (id) => {
  let response;
  try {
    response = await User.findById(id);
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error retrieving user with id: ' + id });
  }
  if (!response) return res.status(400).send({ message: 'Not found user with id ' + id });

  return returnUserLimitedLocal(response);
};
