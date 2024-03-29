// services/userService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = require('../config').secretKey;

function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

module.exports = {
  generateToken
};
