'use strict';

var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var config = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;


module.exports = function(app) {
    // User Routes
    var commentsAdminController = require('../controllers/admin.comments.controller');
    var commentsClientController = require('../controllers/client.comments.controller');

    //Adding cors for the user profile server routes
    app.use(cors());

    // Setting the client API for the comments
    app.route(config.clientRoutePrefix + '/comments/:legislation')
        .get(commentsClientController.list)
        .post(commentsClientController.post);

    // Setting the admin API for the comments
    app.route(config.adminRoutePrefix + '/comments/:legislation')
        .get(commentsAdminController.list);

    // Deletes the comments
    app.route(config.adminRoutePrefix + '/comments/:legislation/:id')
        .delete(commentsAdminController.remove)
        .put(commentsAdminController.update);

    // Finish by binding the param validator middleware
    app.param('id', paramsValidator('id', VALIDATE_ID));
    app.param('legislation', paramsValidator('legislation', VALIDATE_ID));
};
