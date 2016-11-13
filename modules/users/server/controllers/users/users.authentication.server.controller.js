'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    passport = require('passport'),
    usersHelper = require(path.resolve('./modules/users/server/controllers/users.helper.server.js')),
    User = mongoose.model('User'),
    multer = require('multer'),
    appConfig = require(path.resolve('./config/app.config.js'));

/**
 * Signup
 * @param req.file.profileImage Multipart section for profile image
 * @param req.body The user information
 */
exports.signup = function (req, res) {
    /* We start the saving of the current user */

    // Init user and add missing fields
    var user = new User(req.body);
    user.email = user.email.toLowerCase();

    /*Setting the provider definition to local strategy. Email and password*/
    user.provider = 'local';

    //Assign the type for the new user
    user.type = appConfig.USER_CLIENT;

    // We validate that the email is not already in user
    User.emailExists(user.email, function (err, exists) {
        if (err) {
            return res.status(400).send({
                message: 'Hubo un error al validar tu dirección de correo'
            });
        }

        if( exists ){
            return res.status(400).send({
                message: 'El email brindado ya esta en uso'
            });
        }


        // Then save the user
        user.save(function (err) {
            if (err)
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });

            // Payload for the user creation
            var payload = {
                _id: user._id,
                name: user.name,
                email: user.email,
                type: user.type
            };

            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;

            res.status(201).send(usersHelper.generateToken(payload));
        });
    });
};

/**
 * Sign in after passport authentication
 */
exports.signin = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err || !user)
            return res.status(401).send(info);

        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        console.log( 'user: ' + JSON.stringify(user) );

        var payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type
        };

        res.json(usersHelper.generateToken(payload));

    })(req, res, next);
};

/**
 * Sign out
 */
exports.signout = function (req, res) {
    req.logout();
};