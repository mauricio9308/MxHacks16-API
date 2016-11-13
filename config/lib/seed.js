'use strict';

var _ = require('lodash'),
    config = require('../config'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    crypto = require('crypto'),
    path = require('path'),
    appConfig = require(path.resolve('./config/app.config.js'));

// global seed options object
var seedOptions = {};

function removeUser(user) {
    return new Promise(function (resolve, reject) {
        var User = mongoose.model('User');
        User.find({username: user.username}).remove(function (err) {
            if (err) {
                reject(new Error('Failed to remove local ' + user.username));
            }
            resolve();
        });
    });
}

function saveUser(user) {
    return function () {
        return new Promise(function (resolve, reject) {

            console.log('Seeding saving user: ' + user.name);

            // Then save the user
            user.save(function (err, theuser) {
                if (err) {
                    console.log(err);
                    reject(new Error('Failed to add local ' + user.name));
                } else {
                    resolve(theuser);
                }
            });
        });
    };
}

function savePolitician(politician) {
    return new Promise(function (resolve, reject) {
        // Then save the politician
        politician.save(function (err, thePolitician) {
            if (err) {
                console.log(err);
                reject(new Error('Failed to add politician ' + politician.name));
            } else {
                resolve(thePolitician);
            }
        });
    });
}

function checkUserNotExists(user) {
    return new Promise(function (resolve, reject) {
        var User = mongoose.model('User');
        User.find({username: user.username}, function (err, users) {
            if (err) {
                reject(new Error('Failed to find local account ' + user.username));
            }

            if (users.length === 0) {
                resolve();
            } else {
                reject(new Error('Failed due to local account already exists: ' + user.username));
            }
        });
    });
}

function reportSuccess(password) {
    return function (user) {
        return new Promise(function (resolve, reject) {
            if (seedOptions.logResults) {
                console.log(chalk.bold.red('Database Seeding:\t\t\tLocal user added with password set to ' + password));
            }
            resolve();
        });
    };
}

// save the specified user with the password provided from the resolved promise
function seedTheUser(user) {
    return function (password) {
        return new Promise(function (resolve, reject) {

            var User = mongoose.model('User');
            // set the new password
            user.password = password;

            if (user.username === seedOptions.seedAdmin.username && process.env.NODE_ENV === 'production') {
                checkUserNotExists(user)
                    .then(saveUser(user))
                    .then(reportSuccess(password))
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            } else {
                removeUser(user)
                    .then(saveUser(user))
                    .then(reportSuccess(password))
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            }
        });
    };
}

/**
 * For appending a direct password to the server testing / debug
 * */
function seedTheUserWithPassword(user, password) {
    console.log('Seed user with password');
    return new Promise(function (resolve, reject) {

        var User = mongoose.model('User');
        // set the new password
        user.password = password;

        if ( process.env.NODE_ENV === 'production') {
            checkUserNotExists(user)
                .then(saveUser(user))
                .then(reportSuccess(password))
                .then(function () {
                    resolve();
                })
                .catch(function (err) {
                    reject(err);
                });
        } else {
            removeUser(user)
                .then(saveUser(user))
                .then(reportSuccess(password))
                .then(function () {
                    resolve();
                })
                .catch(function (err) {
                    reject(err);
                });
        }
    });
}

/**
 * We add the default politicians
 * */
function seedPolitician(politician) {
    console.log('Seed Politician');

    return new Promise(function (resolve, reject) {
        console.log('SEEEED');

        // We set the politician
        savePolitician(politician)
            .then(function () {
                console.log('Saved');

                resolve();
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

// report the error
function reportError(reject) {
    return function (err) {
        if (seedOptions.logResults) {
            console.log();
            console.log('Database Seeding Error:\t\t\t' + err);
            console.log();
        }
        reject(err);
    };
}

module.exports.start = function start(options) {
    // Initialize the default seed options
    seedOptions = _.clone(config.seedDB.options, true);

    var User = mongoose.model('User');
    var Politician = mongoose.model('Politician');

    return new Promise(function (resolve, reject) {

        var seedCollaborator = {
            name: 'Colaborador',
            type: appConfig.USER_LAWYER,
            provider: 'local',
            email: 'colaborador@athens.org',
            enabled: true,
            updated: new Date(),
            created: new Date()
        };

        var seedAdmin = {
            name: 'Super Admin',
            type: appConfig.USER_SUPER_ADMIN,
            provider: 'local',
            email: 'admin@athens.org',
            enabled: true,
            updated: new Date(),
            created: new Date()
        };

        // Seed of the base users
        var adminAccount = new User(seedAdmin);
        var userAccount = new User(seedCollaborator);

        // Seed of the politicians
        var politicianA = new Politician({
            name: 'Javier Duarte',
            party: 'Partido Revolucionario Institucional'
        });

        var politicianB = new Politician({
            name: 'Enrique Peña Nieto',
            party: 'Partido Revolucionario Institucional'
        });

        var politicianC = new Politician({
            name: 'Ricardo Anaya',
            party: 'Partido Acción Nacional'
        });

        var politicianD = new Politician({
            name: 'Andres Manuel López Obrador',
            party: 'MORENA'
        });

        seedTheUserWithPassword(userAccount, 'P@ssword123')
            .then(seedTheUserWithPassword(adminAccount, 'Administr@tor1')
                .then(seedPolitician( politicianA )
                    .then(seedPolitician(politicianB)
                        .then(seedPolitician(politicianC)
                            .then(seedPolitician(politicianD)
                                .then(function(){
                                    resolve();
                                }))))))
            .catch(reportError(reject));
    });
};
