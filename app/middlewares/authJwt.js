const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.users;

isTokenPresent = (req) => {
  return req.headers['authorization'] !== undefined;
};

extractToken = (req) => {
  return req.headers['authorization'].split('Bearer ')[1];
};

verifyToken = (req, res, next) => {
  if (!isTokenPresent(req)) {
    return res.status(401).send({ message: 'No token provided!' });
  }
  let token = extractToken(req);
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Unauthorized!' });
    }
    User.findById(decoded.id).then((user) => {
      req.authUser = user;
      next();
    });
  });
};

verifyTokenIfPresent = (req, res, next) => {
  if (!isTokenPresent(req)) {
    next();
    return;
  }
  let token = extractToken(req);
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Access denied.' });
    }
    User.findById(decoded.id).then((user) => {
      req.authUser = user;
      next();
    });
  });
};

verifyPermission = (permission) => {
  return (req, res, next) => {
    if (!isTokenPresent(req)) {
      return res.status(401).send({ message: 'No token provided!' });
    }
    let token = extractToken(req);
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: 'Access denied.' });
      }
      User.findById(decoded.id).then((user) => {
        req.authUser = user;
        console.log('verifyPermission:', permission, 'Permissions: ', user.permissions);
        if (user.permissions.includes(permission)) {
          next();
        } else {
          return res.status(403).send({ message: 'Route requires privileges' });
        }
      });
    });
  };
};

const authJwt = {
  verifyToken,
  verifyTokenIfPresent,
  verifyPermission,
};
module.exports = authJwt;
