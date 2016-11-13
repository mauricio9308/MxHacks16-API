/**
 * Dependencies
 * */
var path = require('path'),
    multer = require('multer'),
    mkdirp = require('mkdirp'),
    appConfig = require(path.resolve('./config/app.config.js'));

/**
 * Configuration for the upload of images of the Information Centers
 */
exports.profileImageConfig = {
    limits: {
        fileSize: appConfig.uploads.fileSizeLimit
    },
    /* custom storage policy for the file name */
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            var filePath = appConfig.politicianUploads.profileImageFolder;

            /* we validate/create the folder given */
            mkdirp(filePath, function (err) {
                //Returning the folder definition
                callback(null, filePath);
            });
        },
        filename: function (req, file, cb) {
            var fileName = 'politician-' + Date.now() + path.extname(file.originalname);
            cb(null, fileName);
        }
    })
};