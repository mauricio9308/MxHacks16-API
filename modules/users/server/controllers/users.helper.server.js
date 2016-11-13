'use strict';

/**
 * Created by Mauricio Lara on 10/21/16.
 */

var path = require('path'),
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    q = require('q'),
    config = require(path.resolve('./config/app.config.js')),
    multer = require('multer'),
    mkdirp = require('mkdirp'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Generates the main application token to be used for security
 * @payload Information to be encrypted
 * @algorithm jsonwebtoken valid algorithm (HS256, HS384, HS512,
 *            RS256, RS384, RS512, ES256, ES384, ES512)
 */
exports.generateToken = function(payload, encryptAlgorithm){
    /*The secrets to encrypt the information loaded here to make sure are up to date*/
    var secret = fs.readFileSync(path.resolve('./config/private.key'));

    /*Configuration for jwt*/
    var configObj = {};

    /*Add algorithm if present*/
    if(encryptAlgorithm)
        configObj.algorithm = encryptAlgorithm;

    // Generating the short duration token for the application
    configObj.expiresIn = config.TOKEN_EXPIRE_TIME;
    var applicationToken = jwt.sign(payload, secret, configObj);

    /* Return the generated tokens */
    return {
        applicationToken: applicationToken,
        userInfo: {
            name : payload.name,
            email : payload.email,
            type: payload.type
        }
    };

};

/**
 * Validates if the user is already in our db
 */
exports.doesUserExists = function(loginData, extraInformation){
    console.log('Verify if user exists');
    var def = q.defer();

    if(loginData.email || (extraInformation && extraInformation.email)){
        User.findOne({email: loginData.email ? loginData.email.toLowerCase(): extraInformation.email.toLowerCase()},
            '_id', function(err, user){
            if(err){
                console.log('Error getting user', err);
                return def.reject(err);
            }
            if(user){
                def.resolve(true);
            }else{
                def.resolve(false);
            }
        });
    }else{
        def.resolve(false);
    }

    return def.promise;
};


/**
 * Configuration file for user profile image uploading
 */
exports.profileImageConfig = {
    limits: {
        fileSize: config.uploads.fileSizeLimit
    },
    /* custom storage policy for the file name */
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            var filePath = config.uploads.userProfileImageFolder;

            /* we validate/create the folder given */
            mkdirp(filePath, function (err) {
                //Returning the folder definition
                cb(null, filePath);
            });
        },
        filename: function (req, file, cb) {
            var fileName = 'userImage-' + Date.now() + path.extname(file.originalname);
            cb(null, fileName);
        }
    })
};
