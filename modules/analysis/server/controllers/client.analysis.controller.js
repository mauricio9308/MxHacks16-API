/**
 * Created by Mauricio Lara on 10/24/16.
 */

/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Analysis = mongoose.model('Analysis'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js'));

/**
 * Get a single lawyer analysis
 * */
exports.list = function (req, res) {
    // Legislation to get the analysis
    var legislationToQuery = req.params.legislation;

    /* Getting the analysis of the legislation */
    Analysis
        .find({ legislation : legislationToQuery })
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



