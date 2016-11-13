var path = require('path');
var AppConfig = require(path.resolve('./config/app.config.js'));

/**
 * Handles the admin validation for the different kind of resources
 *
 * Auto handles the case of a user without permissions
 */
exports.handle = function(req, res, superCallback, adminCallback){

    /* checking if a user is logged in */
    if (!req.user && (req.type === undefined || req.type === null)) {
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }

    // Checks the current user type
    if(req.type === AppConfig.USER_SUPER_ADMIN){
        /* list of the cities in the server */
        return superCallback();
    }else if (req.type === AppConfig.USER_LAWYER){
        return adminCallback();
    }else{
        console.log('Unauthorized');
        //Already handled by middleware, just for security
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }
};

/**
 * Validates if the current user is a super admin
 *
 * In case of error the function auto handles the error case
 * */
exports.handleSuperAdmin = function(req, res, superAdminCallback ){
    /* checking if a user is logged in */
    if (!req.user && (req.type === undefined || req.type === null)) {
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }

    // Checks the current user type
    if(req.type === AppConfig.USER_SUPER_ADMIN){
        /* list of the cities in the server */
        return superAdminCallback();
    }else{
        console.log('Unauthorized');
        //Already handled by middleware, just for security
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }
};

/**
 * Validates if the current user is a lawyer
 *
 * In case of error the function auto handles the error case
 * */
exports.handleLawyer = function(req, res, lawyerCallback ){
    /* checking if a user is logged in */
    if (!req.user && (req.type === undefined || req.type === null)) {
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }

    // Checks the current user type
    if(req.type === AppConfig.USER_LAWYER){
        return lawyerCallback();
    }else{
        console.log('Unauthorized');
        //Already handled by middleware, just for security
        return res.status(403).send({
            message: 'No tienes permisos para acceder a este recurso'
        });
    }
};