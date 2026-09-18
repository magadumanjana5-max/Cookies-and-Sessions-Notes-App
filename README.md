# Technical Notes

A simple technical notes application built with Node.js, Express, MongoDB, Mongoose, sessions, and cookies.

The app does not have login or logout. Each browser receives an Express session cookie, and notes are saved with that session's `sessionID` so users see only their own notes.

## Features

- Create a note with a title and description
- View all notes for the current browser session
- Delete notes
- Display note creation dates
- Responsive HTML, CSS, and JavaScript frontend

## Project structure

```text
.
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .env
├── package.json
├── server.js
└── README.md
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Installation

```bash
npm install
```

Configure `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/technical-notes
SESSION_SECRET=replace-this-with-a-long-random-secret
```

For production or a shared machine, replace `SESSION_SECRET` with a long random value and never commit `.env`. It is already ignored by `.gitignore`.

## Run the app

Start the server:

```bash
npm start
```

For automatic restart during development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

### `GET /notes`

Returns notes belonging to the current session.

### `POST /notes`

Creates a note.

Request body:

```json
{
  "title": "Express middleware",
  "description": "Middleware runs between the request and response."
}
```

### `DELETE /notes/:id`

Deletes a note only when it belongs to the current session.

## How it works

1. Express loads `.env` with `dotenv`.
2. `cookie-parser` reads browser cookies.
3. `express-session` creates or restores a session using the session cookie.
4. MongoDB stores each note with its `sessionID`.
5. The frontend calls the API with `fetch()` and updates the notes grid.

Notes are stored in MongoDB and remain available after the server restarts. Clearing the browser cookies creates a new session and hides notes from the previous session.
