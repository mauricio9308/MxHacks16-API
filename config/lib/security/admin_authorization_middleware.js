var unless = require('express-unless'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    jwt = require('jsonwebtoken');

/*
* Middleware for admin authorization
*/
module.exports = function(){

    var middleware = function(req, res, next){
        if(!req.user){
            console.log('Not found req.user, unauthorized');
            return res.status(403).send({
                message: 'No tienes permisos para acceder a este recurso'
            });
        }

        /*Only called when middleware is used*/
        var mongoose = require('mongoose');
        var User = mongoose.model('User');
        var appConfig = require(path.resolve('./config/app.config.js'));

        /**
         * Go for user just for security
         */
        User.findById(req.user._id, 'type', function(err, user){
            if(err || !user){
                console.log('Not found user, unauthorized');
                return res.status(403).send({
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            var type = user.type;

            /**
             * If client or worker do not continue
             */
            if(type !== appConfig.USER_SUPER_ADMIN && type !== appConfig.USER_LAWYER){
                return res.status(403).send({
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            /**
             * Add the user type to the request
             */
            req.adminType = type;

            /*Success*/
            next();
        });

    };

    /*Default middleware's special features*/
    middleware.unless = unless;

    return middleware;
};
