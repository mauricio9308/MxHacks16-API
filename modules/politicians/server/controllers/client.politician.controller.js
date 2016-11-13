/**
 * Created by Mauricio Lara on 10/24/16.
 */

/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Politician = mongoose.model('Politician'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js'));

/**
 * Gets a single politician from the DB
 * */
exports.get = function (req, res) {
    // Politician ID to get
    var politicianId = req.param.id;

    /* listing the politicians */
    Politician
        .findOne({ _id: ObjectId( politicianId) })
        .lean()
        .exec(function (err, politicians) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the list of politicians...
            return res.json(politicians);
        });
};

/**
 * List the actual politicians in the DB
 * */
exports.list = function (req, res) {
    // Query filters
    var listFilter = {};

    /* listing the politicians */
    Politician
        .find(listFilter)
        .sort({name: 1})
        .lean()
        .exec(function (err, politicians) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the list of politicians...
            return res.json(politicians);
        });
};

