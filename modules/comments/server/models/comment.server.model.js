/**
 * Module dependencies
 * */
var mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema;

/**
 * Comment Schema
 * */
var CommentSchema = new Schema({
    text: {
        type: String,
        required: 'Debes proporcionar un nombre'
    },
    legislation: {
        type: Schema.ObjectId,
        ref: 'Legislation',
        required: 'Debes proporcionar una legislación para este comentario'
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Debes proporcionar un dueño'
    }
});

// Registering the schema in Mongo
mongoose.model('Comment', CommentSchema);