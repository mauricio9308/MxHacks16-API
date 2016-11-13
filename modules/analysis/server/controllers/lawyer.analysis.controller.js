/**
 * Created by Mauricio Lara on 10/24/16.
 */

/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Analysis = mongoose.model('Analysis'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js')),
    adminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleLawyer;

/**
 * Post a single comment for a given legislation from the DB
 * */
exports.post = function (req, res) {
    // Checking if the user is an admin user
    adminHandler(req, res, function () {

        // Legislation ID to get
        var legislationId = req.params.legislation;

        /* we check if there's any previous analysis */
        Analysis
            .find({legislation: legislationId, owner: req.user._id})
            .lean()
            .exec(function (err, previousAnalysis) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Checking for a previous analysis
                if( previousAnalysis && previousAnalysis.length > 0 ) {
                    return res.status(400).send({
                        message: 'No puedes enviar mas de un analisis'
                    });
                }

                // We create the comment
                var newAnalysis = new Analysis(req.body);

                // Setting the owner
                newAnalysis.owner = req.user._id;
                newAnalysis.legislation = legislationId;

                // We proceed with the save of the analysis
                newAnalysis.save(function (err) {
                    // Checking any save error
                    if (err) {
                        return res.status(400).send({
                            message: 'ERROR: ' + err
                        });
                    }

                    // We return a successful creation of the resource
                    return res.status(201).json( newAnalysis );
                });
            });
    });
};

/**
 * Get a single lawyer analysis
 * */
exports.get = function (req, res) {

    // Legislation to get the analysis
    var legislationToQuery = req.param.legislation;

    // Analysis to get
    var analysisToGet = req.param.id;

    // Query filters
    var listFilter = { legislation: legislationToQuery, _id : analysisToGet, owner: req.user._id };

    /* Getting the analysis of the legislation */
    Analysis
        .findOne(listFilter)
        .lean()
        .execute(function (err, analysis) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the analysis
            if( analysis ){
                return res.json(analysis);
            }else{
                return res.status(400).send({
                    message: 'Couldn\'t find the analysis'
                });
            }
        });
};

/**
 * Removes an analysis element
 * */
exports.remove = function (req, res) {
    // Validates the current user permissions
    adminHandler(req, res, function () {

        // Legislation
        var legislation = req.params.legislation;

        // Id of the analysis to remove
        var analysisToRemove = req.params.id;

        /* removing the analysis */
        Analysis.remove({_id: analysisToRemove,legislation : legislation, owner: req.user._id},
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


/**
 * Updates an entry of an Analysis
 * */
exports.update = function (req, res) {
    // Validates the current user permissions
    adminHandler(req, res, function () {

        // Legislation
        var legislation = req.params.legislation;

        // Id of the analysis to update
        var commentToRemove = req.params.id;

        // Getting the update body
        var updatePayload = req.body;

        // Building the update object
        var updateObject = {
            text : updatePayload.text
        };

        // Updates the information in the db
        Analysis.update(
            // Update query
            {_id: commentToRemove,legislation : legislation, owner: req.user._id},
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

