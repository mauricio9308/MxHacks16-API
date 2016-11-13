'use strict';

/**
 * Module dependencies
 */
var passport = require('passport');
var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var appConfig = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;

module.exports = function (app) {
    // User Routes
    var users = require('../controllers/users.server.controller');

    // Setting up the users password api
    app.route(appConfig.clientRoutePrefix + '/auth/forgot').post(users.forgot);
    app.route(appConfig.clientRoutePrefix + '/auth/reset/:token')
        .get(users.validateResetToken)
        .post(users.reset);

    // Setting up the users authentication api
    app.route(appConfig.clientRoutePrefix + '/auth/signup').post(users.signup);
    app.route(appConfig.clientRoutePrefix + '/auth/signin').post(users.signin);
    app.route(appConfig.clientRoutePrefix + '/auth/signout').get(users.signout);

    app.param('userType', paramsValidator('userType', !VALIDATE_ID));
};
