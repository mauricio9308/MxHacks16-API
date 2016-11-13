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
        .findOne({id: legislationId})
        .populate('politicians')
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
        .sort({name: 1})
        .populate('politicians analysis')
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
};

