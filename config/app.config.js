'use strict';

/**
 * Created by Mauricio Lara on 5/23/16.
 *
 * Representation of the App Version configuration
 */
module.exports.appVersion = 'v1';
module.exports.adminPrefix = 'admin';

/**
 * User types
 */
module.exports.USER_SUPER_ADMIN = 0;
module.exports.USER_LAWYER = 1;
module.exports.USER_CLIENT = 2;

/* prefixes for the application routes */
module.exports.clientRoutePrefix = '/' + module.exports.appVersion;
module.exports.adminRoutePrefix = '/' + module.exports.appVersion + '/' + module.exports.adminPrefix;

/* Exception routes for authentication middleware*/
var appVersionRegExp = new RegExp('/' + module.exports.appVersion + '/auth', 'i');
var statusResource = '/' + module.exports.appVersion + '/status'; //We want the city list to be openly obtainable
module.exports.authMiddlewareExceptions = [
    { url: appVersionRegExp, methods: ['POST', 'GET']  },
    { url: statusResource, methods: ['GET']},
    { url: /\/img/i, methods: ['GET'] },
    { url: /\/lib/i, methods: ['GET'] }
];

// Preference for the upload of the profile images
module.exports.uploads = {
    fileSizeLimit: 1 * 1024 * 1024 /* file size */,
    informationCenterProfileImageFolder: 'public/img/users/profile'
};

// Preference for the upload of the politician images
module.exports.politicianUploads = {
    fileSizeLimit: 1 * 1024 * 1024 /* file size */,
    profileImageFolder: 'public/img/politician/profile'
};

/**
 * Recovery password config
 */
module.exports.passwordTokenLength = 25;
module.exports.passwordTokenDuration = 3600000; // 1 hour'
