const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.users;
const Match = db.match;

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

//basically if admin than continue
hasPermission = (permission) => {
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
        if (user.permissions.includes(permission)) {
          next();
        } else {
          return res.status(403).send({ message: 'Route requires privileges' });
        }
      });
    });
  };
};

hasPermissionMatchScore = () => {
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
        const id = req.params.id;
        Match.findById(id).then((match) => {
          var users = match.players.map((u) => u.user);
          if (users.includes(user)) {
            next();
          } else {
            return res.status(403).send({ message: 'Route requires privileges' });
          }
        });
      });
    });
  };
};

//basically if admin or the logged in UserID is the same as the Parameter UserID
hasPermissionOrIsUserItself = (permission) => {
  return (req, res, next) => {
    if (!isTokenPresent(req)) {
      return res.status(401).send({ message: 'No token provided!' });
    }
    let token = extractToken(req);
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: 'Access denied.' });
      }
      if (req.params.id == decoded.id) {
        next();
      }
      User.findById(decoded.id).then((user) => {
        req.authUser = user;
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
  hasPermission,
  hasPermissionOrIsUserItself,
  hasPermissionMatchScore,
};
module.exports = authJwt;
