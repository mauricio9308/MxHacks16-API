'use strict';

var path = require('path');
var cors = require('cors');
var paramsValidator = require(path.resolve('./config/lib/helpers/params_validator_middleware.js'));
var config = require(path.resolve('./config/app.config.js'));
var VALIDATE_ID = true;


module.exports = function(app) {
    // User Routes
    var politicianAdminController = require('../controllers/admin.politician.controller');
    var politicianClientController = require('../controllers/client.politician.controller');

    //Adding cors for the user profile server routes
    app.use(cors());

    // Setting the API for the politician
    app.route(config.clientRoutePrefix + '/politician')
        .get(politicianClientController.list);

    app.route(config.clientRoutePrefix + '/politician/:id')
        .get(politicianClientController.get);

    // Setting the admin API for the legislation
    app.route(config.adminRoutePrefix + '/politician')
        .get(politicianAdminController.list)
        .delete(politicianAdminController.remove)
        .post(politicianAdminController.create)
        .put(politicianAdminController.update);

    // Simple test route
    app.route(config.clientRoutePrefix + '/status')
        .get(function( req, res ){
            return res.json({message: 'ok'})
        });

    // Finish by binding the param validator middleware
    app.param('id', paramsValidator('id', VALIDATE_ID));
};
