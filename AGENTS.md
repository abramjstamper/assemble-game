# AI Agent Instructions

Guidelines for Claude Code and other AI assistants working on this codebase.

## Project Overview

**Assemble** is a web-based children's physics game built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Physics**: Matter.js
- **Testing**: Vitest + Testing Library
- **Styling**: CSS with Windows XP aesthetic

## Key Files

| Purpose | Location |
|---------|----------|
| Game specification | `SPEC.md` |
| Physics engine | `src/hooks/usePhysics.ts` |
| Global state | `src/hooks/useGameState.tsx` |
| Undo/redo | `src/hooks/useUndo.ts` |
| Canvas rendering | `src/components/GameCanvas/GameCanvas.tsx` |
| Dimensions/constants | `src/constants/dimensions.ts` |
| Color palettes | `src/constants/colors.ts` |
| Type definitions | `src/types/` |

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + production build
npm run test:run   # Run tests once
npm run test       # Run tests in watch mode
npm run lint       # ESLint check
```

## Architecture Notes

### State Management
- Uses React Context (`GameProvider`) for global state
- Undo/redo uses snapshot-based history (stores shape arrays)
- Physics state lives in refs to avoid re-renders

### Window Globals
Game functions are exposed on `window` for cross-component communication:
- `window.__gameUndo()` - Undo last action
- `window.__gameRedo()` - Redo last action
- `window.__gameClearBalls()` - Clear all balls
- `window.__gameReset()` - Reset entire session
- `window.__gameLoadState(saveData)` - Load saved game state (shapes, spawnRate)

Types are declared in `src/types/globals.d.ts`.

### Canvas Rendering
- 1600x900 fixed canvas size
- Matter.js handles physics simulation
- Custom render loop draws shapes and balls
- Shapes are static Matter.js bodies

## Code Style

- Prefer editing existing files over creating new ones
- Follow existing patterns in the codebase
- Run `npm run lint` before committing
- All tests must pass (`npm run test:run`)

## Common Tasks

### Adding a new shape type
1. Add type to `src/types/shapes.ts` (`ShapeType` union)
2. Add config to `SHAPE_CONFIGS` in same file
3. Add color mapping in `src/constants/colors.ts`
4. Add toolbar button in `src/components/Toolbar/Toolbar.tsx`

### Modifying physics behavior
- Ball spawning: `src/hooks/usePhysics.ts` (look for `spawnBall`)
- Collision: Matter.js handles this automatically
- Constants: `src/constants/dimensions.ts` (gravity, bounce, etc.)

### Changing spawn position
- `SPAWN_X_RATIO` in `src/constants/dimensions.ts`
- Currently 25% from left edge (x=400)

## Testing

- Tests live alongside source files (`*.test.ts` / `*.test.tsx`)
- Use `happy-dom` environment (configured in `vite.config.ts`)
- Mock canvas context in `src/test/setup.ts`
- Run specific test: `npx vitest run src/path/to/file.test.ts`

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Test** - Runs `npm run test:run`
2. **Lint** - Runs `npm run lint`
3. **Build** - Runs `npm run build` (only after test+lint pass)

Triggers on push to `main` and pull requests.
