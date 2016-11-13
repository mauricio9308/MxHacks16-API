'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);
var appConfig = require(path.resolve('./config/app.config.js'));

/**
 * Forgot for reset password. First step.
 */
exports.forgot = function(req, res, next) {
    console.log('Entered to forgot password');
    async.waterfall([
        // Generate random token
        function(done) {
            crypto.randomBytes(appConfig.passwordTokenLength, function(err, buffer) {
                var token = buffer.toString('hex');
                if(err)
                    console.log('Error when creating token');
                done(err, token);
            });
        },
        // Lookup user by email
        function(token, done) {
            if (!req.body.email){
                console.log('Missing email field');
                return res.status(400).send({
                    message: 'El campo de correo no debe de estar vacío'
                });
            }

            User.findOne({
                email: req.body.email.toLowerCase()
            }, '-salt -password', function(err, user) {
                if (err || !user) {
                    console.log('No user found with email: ' + req.body.email);
                    return res.status(400).send({
                        message: 'No hay un usuario registrado con ese correo'
                    });
                }

                // Future proof validation of the current provider
                if (user.provider !== 'local') {
                    console.log('User not registered with local strategy');
                    return res.status(400).send({
                        message: 'Parece que te has registrado con tu cuenta de ' + user.provider
                    });
                }

                //Setting the password reset token and expire date
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + appConfig.passwordTokenDuration;

                user.save(function(err) {
                    if(err)
                        console.log('Error saving the password token', err);
                    done(err, token, user);
                });

            });
        },
        function(token, user, done) {

            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
                httpTransport = 'https://';
            }
            //Sending email
            res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
                name: user.firstName,
                appName: config.app.title,
                url: httpTransport + req.headers.host + '/v1/auth/reset/' + token
            }, function(err, emailHTML) {
                if(err)
                    console.log('Error rendering email HTML', err);
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Recuperación de contraseña',
                html: emailHTML
            };
            //Sending rendered email html
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    console.log('Sending email error', err);
                    return res.status(400).send({
                        message: 'Error al eviar correo'
                    });

                } else {
                    console.log('Successfully sent email');
                    res.send({
                        message: 'Se ha enviado un correo a la dirección de correo electrónico asociado.'
                    });
                }

                done(err);
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * Reset password GET from email token. This validates and then redirects
 */
exports.validateResetToken = function(req, res) {
    console.log('Entered to validate reset password token');
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (err || !user) {
            return res.render('modules/users/server/views/invalid_password_token');
        }
        return res.render('modules/users/server/views/change_password',{
            port:config.port
        });
    });
};

/**
 * Reset password. This receives the new password
 */
exports.reset = function(req, res, next) {
    console.log('Entered to change password');
    // Init Variables
    var passwordDetails = req.body;

    async.waterfall([

        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err || !user) {
                    console.log('Password reset token is invalid or has expired');
                    return res.status(400).send({
                        message: 'El token de recuperación es inválido o ha expirado'
                    });
                }

                if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
                    console.log('Passwords does not match');
                    return res.status(400).send({
                        message: 'Las contraseñas no coinciden'
                    });
                }

                user.password = passwordDetails.newPassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    if (err) {
                        console.log('Error saving the new password',err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }

                    req.login(user, function(err) {
                        if (err) {
                            console.log('Error login the user' + err);
                            return res.status(400).send(err);
                        }

                        // Remove sensitive data before return authenticated user
                        user.password = undefined;
                        user.salt = undefined;

                        res.json({
                            message: "La contraseña se cambió exitosamente"
                        });

                        //Continues after respond. Sends the confirm email
                        done(err, user);

                    });

                });
            });
        },
        //Sends confirmation email
        function(user, done) {
            //Prepare html
            res.render('modules/users/server/templates/reset-password-confirm-email', {
                name: user.firstName,
                appName: config.app.title
            }, function(err, emailHTML) {
                if(err)
                    console.log('Error preparing confirm email html', err);
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Tu contraseña se cambió exitosamente',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                if(err)
                    console.log('Error sending confirmation email', err);
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * Change Password
 * @param req.body.currentPassword The password to be changed
 * @param req.body.newPassword The new password
 * @param req.body.verifyPassword The confirmation of the new password
 */
exports.changePassword = function(req, res, next) {
    // Init Variables
    var passwordDetails = req.body;

    //Validating logged user
    if (!req.user){
        console.log('The user is not signed in');
        return res.status(400).send({
            message: 'No se encontró un usuario logueado'
        });
    }

    //Validating new password
    if(!passwordDetails.newPassword){
        return res.status(400).send({
            message: 'Debes de proporcionar una nueva contraseña'
        });
    }

    /*Looking for user*/
    User.findById(req.user.id, function(err, user) {
        if(err || !user){
            console.log('User not found');
            return res.status(400).send({
                message: 'No se encontró el usuario'
            });
        }

        //Authenticating user
        if (!user.authenticate(passwordDetails.currentPassword)) {
            console.log('Incorrect current password');
            return res.status(400).send({
                message: 'La contraseña actual es incorrecta'
            });
        }

        if(passwordDetails.newPassword !== passwordDetails.verifyPassword){
            console.log('Passwods do not match');
            return res.status(400).send({
                message: 'Passwords do not match'
            });
        }

        //Setting up the new password to the user
        user.password = passwordDetails.newPassword;

        //Saving the user with the new password
        user.save(function(err) {
            if (err){
                console.log('Error saving the new user\'s password', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            //Login the user
            req.login(user, function(err) {
                if (err) {
                    console.log('Error while logging the new user');
                    return res.status(400).send(err);
                }

                console.log('Successfully changed password');
                res.send({
                    message: 'La contraseña se cambió exitosamente'
                });
            });
        });
    });
};
