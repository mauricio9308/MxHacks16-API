'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path'),
    crypto = require('crypto'),
    validator = require('validator'),
    generatePassword = require('generate-password'),
    owasp = require('owasp-password-strength-test'),
    appConfig = require(path.resolve('./config/app.config.js'));

/**
 * A Validation function for local strategy properties
 */
var validateRequiredProperty = function (property) {
    return (property.length);
};

/**
 * A Validation function for local strategy email
 */
var validateEmail = function (email) {
    return (validator.isEmail(email, {require_tld: false}));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: '',
        validate: [validateRequiredProperty, 'Please fill in your first name']
    },
    type:{ // User identifiers
        type: Number,
        default: appConfig.USER_LAWYER,
        min: appConfig.USER_SUPER_ADMIN,
        max: appConfig.USER_CLIENT
    },
    salt: {
        type: String
    },
    password: {
        type: String,
        default: ''
    },
    // future proof implementation for other login provider ( Google, Facebook, Github, etc...)
    provider: {
        type: String,
        default: 'local'
    },
    email: {
        type: String,
        index: {
            unique: true,
            sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
        },
        lowercase: true,
        trim: true,
        default: '',
        validate: [validateEmail, 'Por favor, ingresa un correo']
    },
    enabled: {
        type: Boolean,
        default: true
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function (next) {
    if (this.provider === 'local' && this.password && this.isModified('password')) {
        //TODO: Change this library to another less strict
        var result = owasp.test(this.password);
        if (result.errors.length) {
            var error = result.errors.join(' ');
            this.invalidate('password', error);
        }
    }

    next();
});

/**
 * Returns the complete file path for user profile image
 */
UserSchema.methods.getImageFilePath = function (cb) {
    return 'public/' + this.profileImageURL;
};

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

/**
 * Validates if a user already exists
 */
UserSchema.statics.emailExists = function (email, callback) {
    var _this = this;

    _this.findOne({
        email: email
    }, function (err, user) {
        if (!err) {
            if (user) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        } else {
            callback(err);
        }
    });
};

/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
UserSchema.statics.generateRandomPassphrase = function () {
    return new Promise(function (resolve, reject) {
        var password = '';
        var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

        // iterate until the we have a valid passphrase
        // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
        while (password.length < 20 || repeatingCharacters.test(password)) {
            // build the random password
            password = generatePassword.generate({
                length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
                numbers: true,
                symbols: false,
                uppercase: true,
                excludeSimilarCharacters: true
            });

            // check if we need to remove any repeating characters
            password = password.replace(repeatingCharacters, '');
        }

        // Send the rejection back if the passphrase fails to pass the strength test
        if (owasp.test(password).errors.length) {
            reject(new Error('An unexpected problem occured while generating the random passphrase'));
        } else {
            // resolve with the validated passphrase
            resolve(password);
        }
    });
};

mongoose.model('User', UserSchema);
