
'use strict';

var dsConfig = require('../../datasources.json');
var path = require('path');

module.exports = function(app) {
  var router = app.loopback.Router();
  var Accounts = app.models.Accounts;

  // app.get('/login', function(req, res) {
  //   const username = req.param('username');
  //   const password = req.param('password');
  //   const room = req.param('room');
  //   Accounts.loginUser(username, password, room, res);
  // });

  // app.get('/register', function(req, res) {

  // });

}
