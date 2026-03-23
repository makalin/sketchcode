# SketchCode

From napkin sketch to production-ready React in seconds.

## Overview

SketchCode is a working MVP for a sketch-to-code interface built with Next.js, React, TypeScript, and Tailwind CSS. The current implementation focuses on the editor workflow:

- A component block library for common UI sections
- A drag-and-drop sketch canvas
- Live preview of the generated layout
- Real-time JSX/Tailwind export
- Light, dark, and system theme support

This repo is structured as a strong starting point for expanding into the larger collaborative whiteboard and AI-assisted layout recognition system described in the original concept.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- `next-themes` for dark mode

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  sketch-board-app.tsx
  theme-provider.tsx
  theme-toggle.tsx
lib/
  sketch-data.ts
types/
  sketch.ts
```

## Roadmap

- Real drawing tools instead of block-based sketching
- Multiplayer collaboration with CRDT sync
- AI-powered layout recognition from hand-drawn input
- Export targets beyond React/Tailwind

## License

MIT
