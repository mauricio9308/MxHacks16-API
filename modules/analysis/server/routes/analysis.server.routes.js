'use strict';

var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var config = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;


module.exports = function(app) {
    // User Routes
    var analysisAdminController = require('../controllers/admin.analysis.controller');
    var analysisLawyersController = require('../controllers/lawyer.analysis.controller');

    //Adding cors for the user profile server routes
    app.use(cors());

    // Setting the client API for the comments
    app.route(config.clientRoutePrefix + '/analysis/:legislation')
        .post(analysisLawyersController.post);
    app.route(config.clientRoutePrefix + '/analysis/:legislation/:id')
        .post(analysisLawyersController.get)
        .delete(analysisLawyersController.remove)
        .put(analysisLawyersController.update);

    // Setting the admin API for the comments
    app.route(config.adminRoutePrefix + '/analysis/:legislation')
        .get(analysisAdminController.list);
    // Deletes the comments
    app.route(config.adminRoutePrefix + '/analysis/:legislation/:id')
        .delete(analysisAdminController.remove);

    // Finish by binding the param validator middleware
    app.param('id', paramsValidator('id', VALIDATE_ID));
    app.param('legislation', paramsValidator('legislation', VALIDATE_ID));
};
