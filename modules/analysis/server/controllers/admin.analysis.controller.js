/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Analysis = mongoose.model('Analysis'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js')),
    superAdminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleSuperAdmin;

/**
 * List the actual Analysis in the DB
 * */
exports.list = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Legislation id
        var legislationId = req.param.legislation;

        /* listing the analysis  */
        Analysis
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
 * Removes an analysis element
 * */
exports.remove = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Legislation
        var legislation = req.params.legislation;

        // Id of the analysis to remove
        var analysisToRemove = req.params.id;

        /* removing the analysis */
        Analysis.remove({_id: analysisToRemove,legislation : legislation},
            function (err, analysis) {
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