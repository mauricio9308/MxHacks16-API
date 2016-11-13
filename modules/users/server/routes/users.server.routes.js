'use strict';

var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var config = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;


module.exports = function(app) {
    // User Routes
    var users = require('../controllers/users.server.controller');

    //Adding cors for the user profile server routes
    app.use(cors());

    // Setting up the users profile api
    app.route(config.clientRoutePrefix + '/user/me')
        .get(users.me)
        .put(users.updateMe);
    app.route(config.clientRoutePrefix + '/user/password').post(users.changePassword);
};
