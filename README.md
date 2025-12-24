# Romantic Theater Website

A romantic interactive theater experience built with vanilla JavaScript and HTML/CSS.

## How to Run

This project uses ES6 modules, so it must be served via a web server (cannot be opened directly as a file).

### Option 1: Python HTTP Server (Recommended - No Installation Needed)

If you have Python installed:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

Then open your browser to: `http://localhost:8000`

### Option 2: Node.js http-server

If you have Node.js installed:

1. Install http-server globally (one-time):
```bash
npm install -g http-server
```

2. Run the server:
```bash
http-server
```

Then open your browser to: `http://localhost:8080`

### Option 3: VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Any Other HTTP Server

You can use any HTTP server that serves static files. Just make sure to:
- Serve from the project root directory
- Access via `http://localhost:[port]` (not `file://`)

## Project Structure

- `index.html` - Main entry point
- `scripts/` - JavaScript modules for each act/scene
- `styles/` - CSS stylesheets
- `data/` - JSON data files (compliments, reasons)

## Features

- Act I: Opening scene with curtain animation
- Act II: Three interactive games (Puzzle, Matching, Catch)
- Act III: Reasons viewer
- Act IV: Final question

