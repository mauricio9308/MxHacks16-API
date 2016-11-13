'use strict';

var defaultEnvConfig = require('./default'),
    path = require('path'),
    appConfig = require(path.resolve('./config/app.config.js'));

module.exports = {
  db: {
    uri: 'mongodb://hack:hack@ec2-54-186-5-157.us-west-2.compute.amazonaws.com:27017/athens-dev',
    //uri: 'mongodb://opt/bitnami/mongodb/tmp/mongodb-27017.sock:27017/athens',
    options: {
      user: 'mauricio',
      pass: 'password'
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      // stream: {
      //  directoryPath: process.cwd(),
      //  fileName: 'access.log',
      //  rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
      //    active: false, // activate to use rotating logs
      //    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
      //    frequency: 'daily',
      //    verbose: false
      //  }
      // }
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  // TODO change this configuration for the mailing options
  mailer: {
    from: process.env.MAILER_FROM || 'mauricio9308@gmail.com',
    options: {
        port: 465,
        host: '--todo--set-host--',
        secureConnection: true,
        auth: {
            user: process.env.MAILER_EMAIL_ID || 'noreply@fixin.com.mx',
            pass: process.env.MAILER_PASSWORD || 'casademauricio123'
        }
    }
  },
  livereload: true,
  seedDB: {
    //seed: true,
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: true
      //logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false'
    }
  }
};
