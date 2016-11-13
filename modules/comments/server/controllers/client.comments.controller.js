/**
 * Created by Mauricio Lara on 10/24/16.
 */

/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Comment = mongoose.model('Comment'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js'));

/**
 * Post a single comment for a given legislation from the DB
 * */
exports.post = function (req, res) {
    // Legislation ID to get
    var legislationId = req.param.legislation;

    /* we check if there's any previous comment */

    Comment
        .find({legislation: legislationId, owner: req.user._id})
        .lean()
        .exec(function (err, previousComment) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Checking for a previous comment
            if( previousComment ) {
                return res.status(400).send({
                    message: 'No puedes enviar mas de un comentario'
                });
            }

            // We create the comment
            var newComment = new Comment(req.body);

            // Setting the owner
            newComment.owner = req.user._id;

            // We proceed with the save of the comment
            newComment.save(function (err) {
                // Checking any save error
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // We return a successful creation of the resource
                return res.status(201).json( newComment );
            });
        });
};

/**
 * List the actual politicians in the DB
 * */
exports.list = function (req, res) {
    var lesgilationToQuery = req.param.legislation;

    // Query filters
    var listFilter = { legislation: lesgilationToQuery };

    /* listing the politicians */
    Comment
        .find(listFilter)
        .populate('owner')
        .lean()
        .exec(function (err, comments) {
            // Checking for any errors..
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Returning the list of comment
            return res.json(comments);
        });
};

