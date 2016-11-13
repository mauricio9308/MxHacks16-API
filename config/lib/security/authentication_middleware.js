/**
 * Created by Mauricio Lara 05/24/16
 *
 * Authentication middleware for the handling of the token updates
 */
var unless = require('express-unless'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    jwt = require('jsonwebtoken');

var TOKEN_EXPIRED = 498;
var TOKEN_INVALID = 499;
var FORBIDDEN = 403; //Banned error

/**
* Middleware for token interceptor
*/
module.exports = function(options){
    /*
    Validation of the secret of the application
    options={
        secret: 'TheSecret'
    }
    */
    /**
     * Validates the current authorization header for a valid structure
     * */
    function isTokenHeaderValid(req){

        /*Verify existence of the Authentication header*/
        if(!req.headers || !req.headers.authorization){
            console.log('Authorization header not found');
            return false;
        }

        /*Validating structure*/
        var parts = req.headers.authorization.split(' ');
        if(parts.length !== 2){
            console.log('Malformed authorization header');
            return false;
        }

        /*Validating content*/
        var scheme = parts[0];
        if (!/^Bearer$/i.test(scheme)) {
            console.log('Bearer section incorrect');
            return false;
        }

        return true;
    }

    /**
     * We validate the structure of the accept header for the petitions
     *
     * Current validation of the accept header of the API
     *  application/vendor.api.athens.xyz; v1
     * */
    function isAcceptHeaderValid(req){
        // We only request the configuration resource when needed
        var appConfig = require(path.resolve('./config/app.config.js'));

        /*Verify existence of the accept header*/
        if(!req.headers || !req.headers.accept){
            console.log('Accpet header not found');
            return false;
        }
        /*Validating structure*/
        var parts = req.headers.accept.split(' ');
        if(parts.length !== 2){
            console.log('Malformed accept header');
            return false;
        }

        /* Validating application reference value */
        var scheme = parts[0];
        if (!/^application\/vendor.api.athens.xyz;$/i.test(scheme)) {
            console.log('Invalid first accept arg');
            return false;
        }

        /* Validating application version value  */
        var scheme2 = parts[1];
        var versionRegExp = new RegExp('^' + appConfig.appVersion + '$', 'i');
        if (!versionRegExp.test(scheme2)) {
            console.log('Invalid second accept arg');
            return false;
        }

        return true;
    }

    var middleware = function(req, res, next){

        /*Only called when middleware is used*/
        var mongoose = require('mongoose');
        var User = mongoose.model('User');
        var rawToken = '';
        var decodedToken = '';

        console.log('******** Authentication Middleware ********');

        /*Middleware options*/
        if(!options || !options.secret){
            console.log('Missing token');
            return res.status(400).send({
               message: 'Palabra secreta faltante'
            });
        }

        /*Verify token header*/
        if(!isTokenHeaderValid(req)){
            console.log('Invalid token');
            return res.status(401).send({
                reason: TOKEN_INVALID,
                message: 'Tu token no está presente o es inválido'
            });
        }

        //if(!isAcceptHeaderValid(req)){
        //    console.log('Invalid accept header');
        //    return res.status(401).send({
        //       message: 'La aplicación no tiene permisos para acceder a este recurso'
        //    });
        //}

        rawToken = req.headers.authorization.split(' ')[1];

        // We append the user information
        try{
            /*Verify and decode the token*/
            decodedToken = jwt.verify(rawToken, options.secret);

            /* Find the user and add it to the request */
            User
            .findOne({
                _id: decodedToken._id
            })
            .select({
                _id : 1,
                name: 1,
                type: 1,
                email: 1,
                enabled: 1,
                updated: 1,
                created: 1
            })
            .exec(function(err, user){
                if(err){
                    console.log('Mongoose error: ', err);
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                }

                if(!user){
                    console.log('User not found, invalid token');
                    return res.status(401).send({
                        reason: TOKEN_INVALID,
                        message: 'Tu token es inválido'
                    });
                }

                if(user.banned){
                    console.log('Banned user');
                    return res.status(FORBIDDEN).send({
                       message: 'Has sido banneado, por lo tanto no podrás acceder a ningún recurso'
                    });
                }

                /*Assign user*/
                req.user = user;

                /*Success*/
                next();
            });

        }catch(err){
            /*Error handling when decoding token*/
            if(err.name === 'JsonWebTokenError'){
                console.log('Invalid token', err.message);
                /*Could be a long or extra_long token, thus the secret will fail*/
                return res.status(401).send({
                    reason: TOKEN_INVALID,
                    message: 'Tu token es inválido, verifica que estés mandando el correcto'
                });
            }

            if(err.name === 'TokenExpiredError'){
                console.log('Expired token', err.message);
                return res.status(401).send({
                    reason: TOKEN_EXPIRED,
                    message: 'Tu token ha expirado'
                });
            }
        }

    };

    /*Default middleware's special features*/
    middleware.unless = unless;

    return middleware;
};
