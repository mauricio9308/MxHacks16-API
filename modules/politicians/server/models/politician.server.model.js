/**
 * Module dependencies
 * */
var mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

/**
 * Politician Schema
 * */
var PoliticianSchema = new Schema({
    name: {
        type: String,
        required: 'Debes proporcionar un nombre'
    },
    image: {
        type: String,
        require: 'Debes proporcionar una imagen de perfil'
    },
    party: {
        type: String,
        required: 'Debes proporcionar un partido para este politico'
    }
});

// Registering the schema in Mongo
mongoose.model('Politician', PoliticianSchema);