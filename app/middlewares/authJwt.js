const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.users;

extractToken = (authField) => {
  let tokenarray = authField.split(' ');
  return tokenarray[1];
};

verifyToken = (req, res, next) => {
  let token = extractToken(req.headers['authorization']);

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    User.findById(decoded.id).then((user) => {
      req.authUser = user;
      next();
    });
  });
};

verifyTokenIfPresent = (req, res, next) => {
  let token = extractToken(req.headers['authorization']);
  if (!token) {
    next();
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    User.findById(decoded.id).then((user) => {
      req.authUser = user;
      next();
    });
  });
};

verifyAdminRole = (req, res, next) => {
  let token = extractToken(req.headers['authorization']);

  jwt.verify(token, config.secret, (err, decoded) => {
    if (!decoded.isAdmin) {
      return res.status(401).send({ message: 'Route requires admin privileges' });
    }
    req.isAdmin = true;
    next();
  });
};

verifyAuthorRole = (req, res, next) => {
  let token = extractToken(req.headers['authorization']);
  jwt.verify(token, config.secret, (err, decoded) => {
    if (!decoded.isAuthor) {
      return res.status(401).send({ message: 'Route requires Author privileges' });
    }
    req.isAuthor = true;
    next();
  });
};

verifyAuthorOrAdminRole = (req, res, next) => {
  let token = extractToken(req.headers['authorization']);
  jwt.verify(token, config.secret, (err, decoded) => {
    if (!decoded.isAuthor && !decoded.isAdmin) {
      return res.status(401).send({ message: 'Route requires Author or Admin privileges' });
    }
    next();
  });
};

const authJwt = {
  verifyToken,
  verifyAdminRole,
  verifyAuthorRole,
  verifyAuthorOrAdminRole,
  verifyTokenIfPresent,
};
module.exports = authJwt;
