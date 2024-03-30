// Import necessary Node.js modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Set up the application port
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for serving static files from the public directory within 'Develop'
app.use(express.static(path.join(__dirname, 'Develop', 'public')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve notes.html at the /notes route
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// API route: GET /api/notes - Return all saved notes as JSON
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error reading notes data" });
        }
        res.json(JSON.parse(data));
    });
});

// API route: POST /api/notes - Receive a new note to save on the request body
app.post('/api/notes', (req, res) => {
    const newNote = { ...req.body, id: uuidv4() };

    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error reading notes data" });
        }
        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error writing new note" });
            }
            res.json(newNote); // Return the new note
        });
    });
});

// API route: DELETE /api/notes/:id - Deletes a note by id
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error reading notes data" });
        }

        let notes = JSON.parse(data);
        // Filter out the note with the specified id
        notes = notes.filter(note => note.id !== noteId);

        // Write the modified notes back to db.json
        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error writing updated notes data" });
            }
            res.json({ message: "Note deleted" });
        });
    });
});

// Serve index.html for all other routes as a fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
