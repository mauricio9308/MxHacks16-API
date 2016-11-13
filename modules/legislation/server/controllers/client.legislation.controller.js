/**
 * Created by Mauricio Lara on 10/24/16.
 */

/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Legislation = mongoose.model('Legislation'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js'));

/**
 * Gets a single legislation from the DB
 * */
exports.get = function(req, res){
    /* obtains a single legislation from the DB */
    var legislationId = req.params.id;

    Legislation
        .findById({ _id: ObjectId( legislationId ) })
        .populate('politicians')
        .lean()
        .exec(function (err, legislations) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the list of legislations...
            return res.json(legislations);
        });
};

/**
 * List the actual legislations in the DB
 * */
exports.list = function (req, res) {
    /* inner function for listing the legislations  */
    // Query filters
    var listFilter = {};

    /* listing the legislations */
    Legislation
        .find(listFilter)
        .populate('politicians analysis')
        .sort({name: 1})
        .lean()
        .exec(function (err, legislations) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the list of legislation...
            return res.json(legislations);
        });
};

/**
 * Adds a positive vote to the legislation entry
 * */
exports.addPositiveVote = function( req, res ){

    // Setting the filter
    var legislation = req.param.legislation;

    console.log('Add positive vote...');

    Legislation
        .findOne({id: legislation})
        .lean()
        .exec(function (err, legislations) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            console.log('Get legislation..');


            // Updates the information in the db
            Legislation.update(
                // Update query
                { _id : legislation },
                // Update operation
                { $set: { positiveVotes : legislations.positiveVotes + 1  } })
                .exec(function (updateError, rawError) {
                    // Validate any possible execution error
                    if (updateError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(updateError)
                        });
                    }

                    console.log('Update...');

                    return res.json({ message: 'ok'});
                });
        });

};

/**
 * Adds a negative vote to the legislation entry
 * */
exports.addNegativeVote = function( req, res ){
    // Setting the filter
    var legislation = req.param.legislation;

    console.log('Add negative vote...' + legislation );

    // Updates the information in the db
    Legislation.findOneAndUpdate(
        // Update query
        { _id : legislation },
        // Update operation
        { $inc: { negativeVotes : -1 }})
        .exec(// Callback function
        function (updateError, rawError) {
            // Validate any possible execution error
            if (updateError) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(updateError)
                });
            }

            return res.json({ message: 'ok'});
        });
};

