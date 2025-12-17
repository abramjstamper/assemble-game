# Assemble

A web-based children's physics game where colorful balls drop from the top of the screen and bounce off user-placed objects. Players use their imagination to redirect falling balls using various shapes and ramps.

## Features

- **Physics-based gameplay** - Balls fall with gravity and bounce off shapes
- **5 shape types** - Short/medium/long lines and small/large squares
- **Two visual themes** - Light ("Whimsical") and Dark ("Blacklight")
- **Windows XP aesthetic** - Nostalgic gradients and 3D buttons
- **Undo/redo** - Full history of shape placements
- **Save/load** - Export and import game states as JSON
- **Statistics tracking** - Session and lifetime stats

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
git clone https://github.com/abramjstamper/assemble-game.git
cd assemble-game
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Production files output to `dist/`.

## Controls

| Action | Control |
|--------|---------|
| Place shape | Click shape button, then click canvas |
| Move shape | Click and drag |
| Rotate shape | Select shape, scroll wheel |
| Delete shape | Click delete button, then click shape |
| Play/Pause | Space |
| Settings | Escape |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Matter.js** - Physics engine
- **Vitest** - Testing framework

## Project Structure

```
src/
  components/     # React components
    GameCanvas/   # Main game rendering
    Toolbar/      # Shape and action buttons
    Settings/     # Settings overlay
    Onboarding/   # First-run experience
    StatsBar/     # Statistics display
  hooks/          # Custom React hooks
    usePhysics    # Matter.js integration
    useGameState  # Global state management
    useUndo       # Undo/redo functionality
  constants/      # Game constants
  themes/         # Light/dark theme definitions
  types/          # TypeScript type definitions
```

## Documentation

- [Game Specification](SPEC.md) - Detailed game design document
- [AI Agent Instructions](AGENTS.md) - Guidelines for AI assistants

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## License

Private project.
