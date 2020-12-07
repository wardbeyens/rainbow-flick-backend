const config = require('../config/auth.config');
const db = require('../models');
const User = db.users;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { response } = require('express');

// Create and Save a new user
exports.create = (req, res) => {
  // Validate request
  validationMessages = [];

  //First Name
  if (!req.body.firstName) {
    validationMessages.push('FirstName is required.');
  } else if (req.body.firstName.length < 2) {
    validationMessages.push('FirstName must be at least 2 characters');
  } else if (req.body.firstName.length > 24) {
    validationMessages.push('FirstName can not be longer than 24 characters');
  }

  //Last Name
  if (!req.body.lastName) {
    validationMessages.push('LastName is required.');
  } else if (req.body.lastName.length < 3) {
    validationMessages.push('LastName must be at least 3 characters');
  } else if (req.body.lastName.length > 56) {
    validationMessages.push('LastName can not be longer than 56 characters');
  }

  // Email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!req.body.email) {
    validationMessages.push('Email is required.');
  } else if (!emailRegex.test(req.body.email)) {
    validationMessages.push(`${req.body.email} is not a valid email`);
  }

  //Last Name
  if (!req.body.password) {
    validationMessages.push('Password is required.');
  } else if (req.body.password.length < 3) {
    validationMessages.push('Password must be at least 3 characters');
  } else if (req.body.password.length > 128) {
    validationMessages.push('Password can not be longer than 128 characters');
  }

  //Last Name
  if (!req.body.dateOfBirth) {
    validationMessages.push('Birthday is required.');
  } else if (isNaN(req.body.dateOfBirth.getTime())) {
    // d.valueOf() could also work
    validationMessages.push('Birthday must be a date');
  }

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    res.status(404).send({ message: validationMessages });
  }

  // Create a user
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    Password: bcrypt.hashSync(req.body.Password, 8),
  });

  if (req.body.imageURL) {
    user.imageURL = req.body.imageURL;
  } else {
    user.imageURL = 'http://localhost:8080/images/placeholder.png';
  }

  User.find({
    email: req.body.email,
  }).then((response) => {
    if (response.length == 0) {
      storeUserInDatabase(user, res);
    } else {
      res.status(404).send({ message: `Already exists an account with emailaddress ${user.Email}.` });
    }
  });
};

// Save user in the database

// Find a single user with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found user with id ' + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving user with id=' + id });
    });
};

exports.authenticate = (req, res) => {
  User.findOne({
    Username: req.body.Username,
  })
    .select('+Password')
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(200).send({ error: 'Aanmelden mislukt' });
      }

      var passwordIsValid = bcrypt.compareSync(req.body.Password, user.Password);

      if (req.body.Password == user.Password) {
        passwordIsValid = true;
      }

      if (!passwordIsValid) {
        return res.send({
          error: 'Aanmelden mislukt',
        });
      }

      var token = jwt.sign(
        { id: user.id, isAdmin: user.RoleID == roleIDs.admin, isAuthor: user.RoleID == roleIDs.author },
        config.secret,
        {
          expiresIn: 86400, // 24 hours
        }
      );

      res.status(200).send({
        Id: user._id,
        Username: user.Username,
        Email: user.Email,
        AccessToken: token,
      });
    });
};

exports.findAuthors = (req, res) => {
  User.find({ RoleID: roleIDs.author })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving tags.',
      });
    });
};

// Delete a user with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  if (req.authUser._id == id) {
    res.status(404).send({ message: "Can't delete own account" });
    return;
  }

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete user with id=${id}. Maybe user was not found!`,
        });
      } else {
        res.send({
          message: 'user was deleted successfully!',
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Could not delete user with id=' + id,
      });
    });
};

storeUserInDatabase = (user, res) => {
  user
    .save(user)
    .then((data) => {
      var token = jwt.sign({ id: user.id, permissions: user.permissions }, config.secret, {
        expiresIn: 86400, // 24 hours
      });
      res.send({
        id: data._id,
        firstName: data.FirstName,
        lastName: data.LastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        AccessToken: token,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the user.',
      });
    });
};

exports.createAuthor = (req, res) => {
  // Validate request
  validationMessages = [];

  // Email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!req.body.Email) {
    validationMessages.push('Email is required.');
  } else if (!emailRegex.test(req.body.Email)) {
    validationMessages.push(`${req.body.Email} is not a valid email`);
  }

  // Username validation
  if (!req.body.Username) {
    validationMessages.push('Username is required.');
  } else if (req.body.Username.length < 3) {
    validationMessages.push('Username must be at least 3 characters');
  } else if (req.body.Username.length > 16) {
    validationMessages.push('Username can not be longer than 16 characters');
  }

  //First Name
  if (!req.body.FirstName) {
    validationMessages.push('FirstName is required.');
  } else if (req.body.FirstName.length < 2) {
    validationMessages.push('FirstName must be at least 2 characters');
  } else if (req.body.FirstName.length > 24) {
    validationMessages.push('FirstName can not be longer than 24 characters');
  }

  //Last Name
  if (!req.body.LastName) {
    validationMessages.push('LastName is required.');
  } else if (req.body.LastName.length < 3) {
    validationMessages.push('LastName must be at least 3 characters');
  } else if (req.body.LastName.length > 56) {
    validationMessages.push('LastName can not be longer than 56 characters');
  }

  //Last Name
  if (!req.body.LastName) {
    validationMessages.push('LastName is required.');
  } else if (req.body.LastName.length < 3) {
    validationMessages.push('LastName must be at least 3 characters');
  } else if (req.body.LastName.length > 56) {
    validationMessages.push('LastName can not be longer than 56 characters');
  }

  // If request not valid, return messages
  if (validationMessages.length != 0) {
    res.status(404).send({ message: validationMessages });
  }

  // Create a user
  const user = new User({
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    Email: req.body.Email,
    Username: req.body.Username,
    Password: bcrypt.hashSync(req.body.Password, 8),
    RoleID: roleIDs.author,
  });

  findIfExistsByUsernameOrEmail(user).then((response) => {
    if (response.length == 0) {
      storeUserInDatabase(user, res);
    } else {
      var errormessages = [];
      for (const item of response) {
        if (item.Username == user.Username) {
          errormessages.push(`Username ${user.Username} is already taken.`);
        }
        if (item.Email == user.Email) {
          errormessages.push(`Already exists an account with emailaddress ${user.Email}.`);
        }
      }
      res.status(404).send({ message: errormessages });
    }
  });
};

exports.findUserById = (userID) => {
  return User.findById(userID);
};
