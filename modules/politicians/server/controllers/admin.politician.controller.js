/**
 * Dependencies
 * */
var path = require('path'),
    mongoose = require('mongoose'),
    Politician = mongoose.model('Politician'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/core.server.controller.js')),
    politicianConfig = require(path.resolve('./modules/politicians/server/values/politician.center.config.js')),
    superAdminHandler = require(path.resolve('./config/lib/helpers/admin_handler.js')).handleSuperAdmin,
    multer = require('multer');

/**
 * List the actual Politicians in the DB
 * */
exports.list = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        /* listing the politicians  */
        Politician
            .find({})
            .sort({name: 1})
            .lean()
            .execute(function (err, politicians) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Returning the list of politicians
                return res.json(politicians);
            });
    });
};

/**
 * Removes a politcian
 * */
exports.remove = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {
        var politicianToRemove = req.params.politician;

        /* listing the politicians */
        Politician.remove({_id: politicianToRemove},
            function (err, politician) {
                // Checking for any errors..
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                // Returning a successful delete message
                return res.status(200);
            });
    });
};


/**
 * Creates a new politician in the database
 * */
exports.create = function (req, res) {
    // Checking for the current session

    // We validate the super admin permissions
    superAdminHandler(req, res, function(){
        // Creating the new politician object
        var newPolitician = new Politician(req.body);

        // We proceed with the save of the legislation;
        newPolitician.save(function (err) {
            // Checking any save error
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            // We return a successful creation of the resource
            return res.status(201).json( newPolitician );
        });
    });
};

///**
// * Creates a new information center in the database
// * */
//exports.createImage = function (req, res) {
//    // Checking for the current session
//    if( !req.user ){
//        return res.status(401).send({
//            message: 'Este recurso esta reservado a usuarios autorizados'
//        });
//    }
//
//    // Getting the multipart configuration +
//    var uploadFileHanlder = multer(infCenterConfig.profileImageConfig).single('profile');
//
//    // We process the image upload
//    uploadFileHanlder(req, res, function (uploadError) {
//        // Handle of a possible upload error
//        if (uploadError) {
//            return res.status(400).send({
//                message: 'Hubo un error al procesar la imagen de perfil'
//            });
//        }
//
//        //We proceed to handle the reference to the image and assign it to the information center
//        var profileImagePath;
//        if (req.file) {
//            // Parsing the incoming file path
//            var rawPath = req.file.path;
//            profileImagePath = rawPath.substring(
//                rawPath.indexOf('/'), /* occurrence of the first path separator */
//                rawPath.length
//            );
//        }
//
//        // We process the body information
//        var bodyPayload = req.body;
//
//        // Validate the name
//        if (!bodyPayload.name) {
//            return res.status(400).send({
//                message: 'Debes proporcionar un nombre al centro de información'
//            });
//        }
//
//        // Validate the new region to be set
//        Region.regionExists(bodyPayload.region, function (exists) {
//            // Checking for validation error
//            if (!exists) {
//                return res.status(400).send({
//                    message: 'Por favor brinda una región válida'
//                });
//            }
//
//            // Creating the new information center object
//            var newInformationCenter = new InformationCenter(bodyPayload);
//
//            // Setting the image
//            newInformationCenter.image_url = profileImagePath;
//
//            // Setting the owner
//            newInformationCenter.owner = req.user._id;
//
//            // We proceed with the save of the information center;
//            newInformationCenter.save(function (err) {
//                // Checking any save error
//                if (err) {
//                    return res.status(400).send({
//                        message: errorHandler.getErrorMessage(err)
//                    });
//                }
//
//                // We return a successful creation of the resource
//                return res.status(201).json( newInformationCenter );
//            });
//        });
//    });
//};

/**
 * Updates an entry of a Politician
 * */
exports.update = function (req, res) {
    // Validates the current user permissions
    superAdminHandler(req, res, function () {

        // Getting the update body
        var updatePayload = req.body;

        // Building the update object
        var updateObject = {
            name : updatePayload.name,
            party: updatePayload.party
        };

        // Updates the information in the db
        Politician.update(
            // Update query
            {},
            // Update operation
            {$set: updateObject},
            // Callback function
            function (updateError, rawError) {
                // Validate any possible execution error
                if (updateError) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(updateError)
                    });
                }

                return res.status(200);
            }
        );
    });
};