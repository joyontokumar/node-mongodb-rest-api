const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is required'],
        minlength: [3, 'title must 3 character minimum'],
        maxlength: 10
    },
    description: {
        type: String,
        required: [true, 'description must me 10 character'],
        minlength: [10, 'title must 10 character'],
        maxlength: [100, 'description must be less than 100 charcter']
    }
}, {
    timestamps: true
});

// create a model
const Note = mongoose.model('Note', notesSchema);
module.exports = Note