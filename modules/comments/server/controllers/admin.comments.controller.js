/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Comment = mongoose.model('Comment'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js')),
    superAdminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleSuperAdmin,
    multer = require('multer');

/**
 * List the actual Comments in the DB
 * */
exports.list = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Legislation id
        var legislationId = req.param.legislation;

        /* listing the politicians  */
        Comment
            .find({ legislation : legislationId})
            .sort({name: 1})
            .lean()
            .execute(function (err, comments) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Returning the list of comments
                return res.json(comments);
            });
    });
};

/**
 * Removes a comments
 * */
exports.remove = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Legislation
        var legislation = req.params.legislation;

        // Id of the comment to remove
        var commentToRemove = req.params.id;

        /* deleting a comment */
        Comment.remove({_id: commentToRemove,legislation : legislation},
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
 * Updates an entry of a Politician
 * */
exports.update = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Legislation
        var legislation = req.params.legislation;

        // Id of the comment to remove
        var commentToRemove = req.params.id;

        // Getting the update body
        var updatePayload = req.body;

        // Building the update object
        var updateObject = {
            text : updatePayload.name
        };

        // Updates the information in the db
        Comment.update(
            // Update query
            {_id: commentToRemove,legislation : legislation},
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