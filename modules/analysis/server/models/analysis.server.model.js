/**
 * Module dependencies
 * */
var mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

/**
 * Analysis Schema
 * */
var AnalysisSchema = new Schema({
    text: {
        type: String,
        required: 'Debes proporcionar un nombre'
    },
    legislation : {
        type: Schema.ObjectId,
        ref: 'Legislation',
        required: 'Debes seleccionar una legislación para el análisis'
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Debes proporcionar un dueño'
    }
});

// Registering the schema in Mongo
mongoose.model('Analysis', AnalysisSchema);