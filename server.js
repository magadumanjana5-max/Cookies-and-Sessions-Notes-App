require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/technical-notes';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  sessionID: { type: String, required: true, index: true }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'technical-notes-development-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find({ sessionID: req.sessionID }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Could not load notes.' });
  }
});

app.post('/notes', async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const description = typeof req.body.description === 'string'
    ? req.body.description.trim()
    : '';

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const note = await Note.create({ title, description, sessionID: req.sessionID });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Could not save note.' });
  }
});

app.delete('/notes/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      sessionID: req.sessionID
    });

    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Could not delete note.' });
  }
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Technical Notes is running at http://localhost:${PORT}`);
      console.log(`MongoDB connected to ${MONGODB_URI}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();