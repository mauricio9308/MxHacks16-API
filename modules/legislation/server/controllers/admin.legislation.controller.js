/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Legislation = mongoose.model('Legislation'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js')),
    superAdminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleSuperAdmin;

/**
 * List the actual Legislations in the DB
 * */
exports.list = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        /* listing the legislation  */
        Legislation
            .find({})
            .sort({name: 1})
            .lean()
            .execute(function (err, legislations) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Returning the list of legislations...
                return res.json(legislations);
            });
    });
};

exports.remove = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {
        var legislationToRemove = req.params.legislation;

        /* listing the legislations */
        Legislation.remove({_id: legislationToRemove},
            function (err, legislation) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Returning a successful delete message
                return res.status(200);
            });
    });
};


/**
 * Creates a new legislation in the database
 * */
exports.create = function (req, res) {
    // Checking for the current session

    // We validate the super admin permissions
    superAdminHandler(req, res, function(){
        // Creating the new legislation object
        var newLegislation = new Legislation(req.body);

        // Setting the owner
        newLegislation.owner = req.user._id;

        // We proceed with the save of the legislation;
        newLegislation.save(function (err) {
            // Checking any save error
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // We return a successful creation of the resource
            return res.status(201).json( newLegislation );
        });
    });
};

/**
 * Updates an entry of a Legislation
 * */
exports.update = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Getting the update body
        var updatePayload = req.body;

        // Building the update object
        var updateObject = {
            name : updateObject.name
        };

        // Updates the information in the db
        Legislation.update(
            // Update query
            {},
            // Update operation
            {$set: updateObject},
            // Callback function
            function (updateError, rawError) {
                // Validate any possible execution error
                if (updateError) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(updateError)
                    });
                }

                return res.status(200);
            }
        );
    });
};