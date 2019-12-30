const express = require("express");
const app = express();

// express validator
const { check, validationResult } = require('express-validator');


// mongoose connect
const mongoose = require("mongoose");
// middleware
app.use(express.json());

// model import
const Note = require("./models/notes");

// connecting databse
mongoose.connect('mongodb://localhost:27017/notes-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("databse connect succefully")
}).catch((err) => console.log(err));

// get route
app.get("/", (req, res) => {
    res.send("welcome to our node js");
});

// get notes show all notes
app.get("/notes", async (req, res) => {
    try {
        const notes = await Note.find();
        res.send(notes);
    } catch (error) {
        res.status(500).send(error);
    }
});

// get single notes
app.get("/notes/:noteId",
    check('noteId', 'Note not found').isMongoId(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).send(errors.array());
        }
        try {
            const id = req.params.noteId;
            const note = await Note.findById(id);
            if (!note) return res.status(404).send("no note found");
            res.send(note);
        } catch (error) {
            res.status(500).send(error)
        }

    });

// post request or adding  notes
app.post("/notes",
    [
        check('title').notEmpty().isLength({ min: 3, max: 10 }).withMessage('Title is required and must 3 to 10 character'),
        check('description').notEmpty().isLength({ min: 10, max: 100 }).withMessage('Description is required and must 10 to 100 character'),
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        const note = new Note(req.body);

        try {
            await note.save();
            res.send(note);
        } catch (error) {
            res.status(400).send(error);
        }
    });

// update notes or put request
app.put("/notes/:noteId",
    [
        check('noteId', 'note not found').isMongoId(),
        check('title', 'title is required').optional().notEmpty(),
        check('description', 'description is required').optional().notEmpty(),
    ],
    async (req, res) => {
        const id = req.params.noteId;
        const gotNoteInput = Object.keys(req.body);
        const allowUpdates = ['title', 'description'];
        const isAlowed = gotNoteInput.every(update => allowUpdates.includes(update));
        if (!isAlowed) return res.status(400).send("Invalid update");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.array());
        }
        try {
            const note = await Note.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            });
            if (!note) return res.status(404).send("no note found");
            res.send(note);

        } catch (error) {
            res.status(500).send(error)
        }
    });

// delete notes or delete request
app.delete("/notes/:noteId",
    check('noteId', 'note not found').isMongoId(),
    async (req, res) => {
        const id = req.params.noteId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).send(errors.array());
        }
        try {
            const note = await Note.findByIdAndDelete(id);
            if (!note) return res.status(400).send("note not found");
            res.send(note);

        } catch (error) {
            res.status(500).send(errors);
        }
    });

//  not found page
app.get("*", (req, res) => {
    res.send("404 page not found");
})
// create a server
app.listen(3000, () => {
    console.log("server running port 3000");
})