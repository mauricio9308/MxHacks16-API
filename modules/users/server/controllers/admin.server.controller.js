'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    pagination = require(path.resolve('config/lib/pagination.js')),
    superAdminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleSuperAdmin;

/**
 * NOTE: The reason that in the read and update methods the query works,
 * is to allow us to identify that the reason is a permission thing, or
 * a non existent user. In the case of listing, is hard to implement this, so
 * we implement a better (effective) logic at the expense of the permissions message
 */

/**
 * Show the current user
 */
exports.read = function(req, res) {
    console.log('Admin entered to get user');

    // Handling of the super admin type
    superAdminHandler( req, res, function(){
        /* reference for the user */
        var userToGet = req.params.userId;

        User.findOne({ _id: userToGet }, '-password -salt', function ( err, user ){
            //Checking if any error was raised
            if( err ){
                console.log('Errror getting user');
                return res.status(400).send({
                    message: errorHandler.getErrorMessage( err )
                });
            }

            if(!user){
                console.log('User not found');
                return res.status(404).send({
                    message: 'El usuario solicitado no se encuentra registrado'
                });
            }

            /* success getting the user */
            res.json(user);
        });
    });
};

/**
 * Update a User
 */
exports.update = function(req, res) {
    console.log('Admin entered to update user');

    //Nobody can change the salt or password
    delete req.body.salt;
    delete req.body.password;

    // Handling of the super admin type
    superAdminHandler(req, res, function(){
        /* reference for the user */
        var userToUpdate = req.params.userId;
        var newUser = req.body;
        newUser.updated = Date.now();

        //If email exists, validate it
        if(newUser.email){
            // We check if the email exists via a helper function
            User.emailExists(newUser.email, function(err, exists){
                if(err){
                    console.log('Error validating email', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage( err )
                    });
                }

                /* we don't let the user to change to a existing email address */
                if(exists){
                    console.log('Existing email');
                    return res.status(400).send({
                        message: 'El email que intentas actualizar ya existe'
                    });
                }

                update();
            });
        }else{
            update();
        }

        //To solve async update handling of the user
        function update(){
            User.findOneAndUpdate({ _id: userToUpdate }, {
                    $set: newUser
                },
                {new:true}).lean().exec(function ( err, user ){
                //Checking if any error was raised
                if( err ){
                    console.log('Errror getting user');
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage( err )
                    });
                }

                if(!user){
                    console.log('User not found');
                    return res.status(404).send({
                        message: 'El usuario solicitado no se encuentra registrado'
                    });
                }

                delete user.password;
                delete user.salt;
                /* success getting the user */
                res.json(user);

            });
        }
    });

};

/**
 * Delete a user
 */
exports.delete = function(req, res) {
    console.log('Admin entered to delete user');

    // Handling of the super user admin
    superAdminHandler( req, res, function(){
        /* reference for the user */
        var userToDelete = req.params.userId;

        User.findByIdAndRemove(userToDelete).lean().exec(function ( err, user ){
            //Checking if any error was raised
            if( err ){
                console.log('Errror getting user');
                return res.status(400).send({
                    message: errorHandler.getErrorMessage( err )
                });
            }

            if(!user){
                console.log('User not found');
                return res.status(404).send({
                    message: 'El usuario solicitado no se encuentra registrado'
                });
            }

            // Removing from the answer sensitive information
            delete user.password;
            delete user.salt;

            /* success getting the user */
            res.json(user);
        });
    });
};

/**
 * List of Users
 */
exports.list = function(req, res) {
    console.log('Admin entered to list users');

    // Handler of the super admin only resource
    superAdminHandler( req, res, function(){
        var pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
        var pageSize = req.query.pageSize ? req.query.pageSize : pagination.DEFAULT_PAGE_SIZE;

        var query = User.find({}, '-password -salt');
        /* we apply the pagination via the local library */
        pagination.paginate(
            User,
            query,
            pageNumber,
            pageSize,
            'users' /* content name */
        ).then( function( pageResult ){
            /* successful pagination fetch */
            console.log('Pagination successful');

            //Returning the pagination result
            res.json( pageResult );
        }).catch(function( errorResult ){
            /* error obtaining the pagination response, handling the error code */
            pagination.handleErrorResult( errorResult, res );
        });
    });
};
