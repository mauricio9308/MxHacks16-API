'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    config = require(path.resolve('./config/config')),
    User = mongoose.model('User'),
    pagination = require(path.resolve('./config/lib/pagination.js'));

/**
 * Update user details
 * @param req.file.profileImage Multipart section for profile image
 * @param req.body The user information
 */
exports.updateMe = function(req, res) {
    console.log('Updating user profile');

    /*
    * By default, when updating a file if the attribute of the object does not
    match with any defined in the schema, it is ignored, so there is not necessary
    to validate it
    */

    if(!req.user){
        console.log('Missing logged user');
        return res.status(400).send({
            message:'No se encontró un usuario logueado'
        });
    }

    //Removing sensitive data that should not be updated
    delete req.body.salt;
    delete req.body.password;
    delete req.body.email;
    delete req.body.banned;
    delete req.body.enabled;
    delete req.body.created;
    delete req.body._id;
    delete req.body.resetPasswordToken;
    delete req.body.resetPasswordExpires;
    delete req.body.type;
    delete req.body.provider;

    //Preparing the new user information
    var userInfoToUpdate = undefined;

    //We find the user just to ensure we are not about to delete information when saving
    User.findOne({_id:req.user.id}, '-salt -password', function(err, user){
        if (err) {
            console.log('Error getting the user to update',err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        //Copy the info provided by req.body into the found user
        var newUser = _.extend(user, userInfoToUpdate);

        newUser.updated = Date.now();

        //Updating the user
        newUser.save(function(err){
            if (err) {
                console.log('Error updating the user',err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // Using passport middleware to login TODO:Check if necessary
            req.login(newUser, function(err) {
                if (err)
                    return res.status(400).send(err);

                console.log('User successfully updated');

                // We just return the non sensitive data
                var toReturn = newUser.toObject();
                delete toReturn.salt;
                delete toReturn.password;
                delete toReturn.email;
                delete toReturn.banned;
                delete toReturn.enabled;
                delete toReturn.created;
                delete toReturn.resetPasswordToken;
                delete toReturn.resetPasswordExpires;
                delete toReturn.type;
                delete toReturn.provider;

                // Returns the user object payload
                res.json(toReturn);
            });
        });
    });
};

/**
 * Gets the user profile's information from the user id provided by the auth middleware
 */
exports.me = function(req, res) {
    console.log('Getting the user\'s owner information');

    /*Unexpected error*/
    if(!req.user){
        console.log('Missing req.user');
        return res.status(400).json({
            message: 'No se hayó información del usuario autorizado'
        });
    }

    // We get the common information from the User
    var query = User.findOne({_id:req.user._id}).select({
        _id: 0,
        name: 1,
        email: 1
    });

    // We realize the search of the current user
    query.exec(function(err, profile){
        if(err){
            console.log('Getting user error', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        res.json(profile);
    });
};
