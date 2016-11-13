'use strict';

/**
 * Module dependencies
 */
var admin = require('../controllers/admin.server.controller'),
    path = require('path'),
    cors = require('cors'),
    AppConfig = require(path.resolve('./config/app.config.js')),
    paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js')),
    VALIDATE_ID = true;

module.exports = function(app) {
    // User route registration first. Ref: #713
    require('./users.server.routes.js')(app);

    app.use(cors());

    app.route(AppConfig.adminRoutePrefix + '/user')
        .get(admin.list);

    app.route(AppConfig.adminRoutePrefix + '/user/:userId')
        .get(admin.read)
        .put(admin.update)
        .delete(admin.delete);

    // Finish by binding the param validator middleware
    app.param('userId', paramsValidator('userId', VALIDATE_ID));
};
