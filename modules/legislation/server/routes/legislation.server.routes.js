/**
 * Created by Mauricio Lara on 11/12/16.
 */

'use strict';

var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var config = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;


module.exports = function(app) {
    // User Routes
    var legislationAdminController = require('../controllers/admin.legislation.controller');
    var legislationClientController = require('../controllers/client.legislation.controller');

    //Adding cors for the user profile server routes
    app.use(cors());

    // Setting the API for the legislations
    app.route(config.clientRoutePrefix + '/legislation')
        .get(legislationClientController.list);

    app.route(config.clientRoutePrefix + '/legislation/:id')
        .get(legislationClientController.get);

    // Voting routes
    app.route(config.clientRoutePrefix + '/legislation/:id/vote/positive')
        .post(legislationClientController.addPositiveVote);
    app.route(config.clientRoutePrefix + '/legislation/:id/vote/negative')
        .post(legislationClientController.addNegativeVote);

    app.route(config.clientRoutePrefix + '/legislation/lawyer')
        .post(legislationAdminController.create);

    // Setting the admin API for the legislation
    app.route(config.adminRoutePrefix + '/legislation/:id')
        .delete(legislationAdminController.remove)
        .put(legislationAdminController.update);

    // Finish by binding the param validator middleware
    app.param('id', paramsValidator('id', VALIDATE_ID));
};
