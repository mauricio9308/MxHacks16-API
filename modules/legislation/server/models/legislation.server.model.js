/**
 * Module dependencies
 * */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path');

/**
 * Legislation Schema
 * */
var LegislationSchema = new Schema({
    name: {
        type: String,
        required: 'Debes proporcionar un nombre'
    },
    text: {
        type: String,
        required: 'Debes proporcionar un lol'
    },
    politicians: [{
        type: Schema.ObjectId,
        ref: 'Politician',
        required: 'Debes propoarcionar un arreglo de supporters'
    }],
    analysis: [{
        type: Schema.ObjectId,
        ref: 'Analysis'
    }],
    positiveVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    negativeVotes : {
        type: Number,
        default: 0,
        min: 0
    }
});

// Registering the schema in Mongo
mongoose.model('Legislation', LegislationSchema);