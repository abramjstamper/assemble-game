# Assemble - Game Specification

## Overview

**Assemble** is a web-based children's physics game where colorful balls drop from the top of the screen and bounce off user-placed objects. Players use their imagination to redirect falling balls using various shapes and ramps. The game features two modes: **Creative** (sandbox) and **Challenge** (goal-oriented).

### Tech Stack
- HTML5 Canvas
- CSS3
- TypeScript
- React
- Physics: Matter.js (recommended) or custom implementation

---

## Game Modes

### Creative Mode
- Freeform sandbox with no objectives
- Unlimited shapes available
- Balls disappear when hitting the bottom of the screen
- Configurable ball spawn rate via settings
- Focus on creativity and experimentation

### Challenge Mode (Stubbed)
- Goal: Guide balls to a specific destination zone
- Limited shape inventory per level
- Balls bounce off ALL walls (including bottom)
- Balls only disappear when reaching the destination zone
- Ball spawn rate determined by level configuration
- Track "balls delivered" statistic
- Future: Procedurally generated mazes/obstacles per level

---

## Visual Themes

### Design Language
- **Windows XP era aesthetic**: Gradients, bubbly 3D buttons, skeuomorphic icons
- All UI elements should feel tactile and playful
- SVG icons for toolbar buttons

### Light Theme ("Whimsical")
- Airy, pastel color palette
- Soft gradients
- Childlike, friendly appearance
- Light background with good contrast for shapes/balls

### Dark Theme ("Blacklight")
- Neon colors on dark background
- 90s rave/blacklight aesthetic
- Glowing effects on shapes and balls
- High contrast, vibrant colors

### Shape Colors
- Each shape TYPE has a fixed, unique color
- Colors must differ between light and dark themes
- Colors should be distinct from ball colors

### Ball Colors
- 16-24 random colors per theme
- Must contrast well with window background
- Must be visually distinct from shape colors
- Two similar hues allowed (e.g., two greens) if distinguishable

---

## Screen Layout

### Target Resolution
- Optimized for 1080p displays (1920x1080)
- **Game canvas: 1600x900 pixels**
- Fixed canvas dimensions (not responsive initially)
- Mobile version deferred to future iteration

### Structure
```
+------------------------------------------+
|              TOOLBAR (fixed)             |
+------------------------------------------+
|                                          |
|                                          |
|       GAME WINDOW (1600x900 canvas)      |
|                                          |
|                                          |
+------------------------------------------+
|              STATS BAR                   |
+------------------------------------------+
```

---

## Dimensions (Relative to Canvas)

All game element sizes are expressed relative to canvas dimensions for future responsiveness.

### Ball
- **Diameter**: 1.5% of canvas width (~24px at 1600w)

### Shapes - Lines
| Type | Length | Thickness |
|------|--------|-----------|
| Short Line | 6% of canvas width (~96px) | 0.5% of canvas width (~8px) |
| Medium Line | 12% of canvas width (~192px) | 0.5% of canvas width (~8px) |
| Long Line | 20% of canvas width (~320px) | 0.5% of canvas width (~8px) |

### Shapes - Squares
| Type | Size |
|------|------|
| Small Square | 3% of canvas width (~48px) |
| Large Square | 6% of canvas width (~96px) |

### Spawn Position
- X: 25% from left edge of canvas (~400px)
- Y: At top edge (0%)

### Endpoint Dots (Lines)
- Diameter: 1% of canvas width (~16px)
- Positioned at each end of line shapes

---

## Toolbar

### Layout
- Fixed position at top of screen
- Square buttons similar to RollerCoaster Tycoon UI
- Each button has hover tooltip explaining function
- Buttons have Windows XP-style 3D appearance

### Buttons (Left to Right)

#### Game Controls
| Button | Icon | Tooltip | Function |
|--------|------|---------|----------|
| Play/Pause | Play/Pause SVG | "Play/Pause game (Space)" | Toggle ball physics and spawning |
| Settings | Gear SVG | "Settings (Escape)" | Open settings overlay |
| Save | Floppy disk SVG | "Save game to file" | Export game state as JSON download |
| Load | Folder SVG | "Load saved game" | Import JSON file to restore state |
| Undo | Left arrow SVG | "Undo last action (Ctrl+Z)" | Revert last shape placement/deletion |
| Redo | Right arrow SVG | "Redo last action (Ctrl+Y)" | Restore undone action |

#### Shapes - Lines (3 lengths)
| Button | Icon | Tooltip | Color |
|--------|------|---------|-------|
| Short Line | Short line SVG | "Short ramp - click to place" | Unique color A |
| Medium Line | Medium line SVG | "Medium ramp - click to place" | Unique color B |
| Long Line | Long line SVG | "Long ramp - click to place" | Unique color C |

#### Shapes - Squares (2 sizes)
| Button | Icon | Tooltip | Color |
|--------|------|---------|-------|
| Small Square | Small square SVG | "Small block - click to place" | Unique color D |
| Large Square | Large square SVG | "Large block - click to place" | Unique color E |

#### Destructive Actions
| Button | Icon | Tooltip | Function |
|--------|------|---------|----------|
| Delete | Trash/X SVG | "Delete mode - click shape to remove" | Enter delete mode, click shape to remove |
| Clear | Eraser SVG | "Clear all balls" | Remove all balls, keep shapes, keep stats |
| Reset | Circular arrow SVG | "Reset session" | Remove all balls + shapes, reset session stats |

---

## Shape Behavior

### Placement
1. User clicks shape button in toolbar
2. Shape appears in center of game canvas
3. User clicks and drags shape to desired location
4. Shape remains draggable after placement
5. **Shapes can be placed in both paused and live mode**

### Interaction
- **Move**: Click and drag shape
- **Rotate**: Click shape, use scroll wheel for 360° rotation
- **Delete**: Click delete button, then click shape to remove

### Visual Design
- Lines have subtle inset light/dark outline matching shape color
- Lines have small dots at each endpoint (for future snapping feature)
- All shapes cast appropriate shadows in light theme
- All shapes have subtle glow in dark theme

### Constraints
- Maximum 256 shapes on screen at any time
- Creative mode: Unlimited shape availability
- Challenge mode: Limited inventory per level

### Collision with Balls
- If shape is placed over a ball, ball disappears
- Disappeared ball does NOT count toward any statistics
- During pause: Placing shape over frozen ball removes the ball

---

## Ball Physics

### Properties
- All balls have identical size (fixed)
- All balls have identical mass/weight
- All balls have identical physics properties
- Ball color is random from theme-appropriate palette
- **Maximum 1024 balls on screen at any time**

### Spawning
- Balls spawn from top of screen
- Spawn position: 25% from left edge, at top (see Dimensions section)
- Creative mode: Spawn rate configurable in settings
- Challenge mode: Spawn rate determined by level
- Spawning pauses when game is paused
- **New balls stop spawning when 1024 ball limit is reached**

### Spawn Rate (Creative Mode)
- **Minimum interval**: 0.25 seconds (4 balls/second max)
- **Maximum interval**: 10 seconds (1 ball every 10 seconds)
- **Default**: TBD (suggest 1-2 seconds)
- Configurable via slider in Settings screen

### Physics Rules
- **Gravity**: Balls accelerate downward
- **Collision**: Balls bounce off shapes and walls
- **Bounce coefficient**: 0.8 (loses 20% velocity on each bounce)
- **Friction**: None (frictionless rolling on slopes)
- **Air resistance**: None
- **No complex physics**: Keep calculations simple

### Wall Behavior
- **Top wall**: Balls bounce
- **Side walls**: Balls bounce
- **Bottom wall (Creative)**: Balls fall through and disappear, counted as "dropped"
- **Bottom wall (Challenge)**: Balls bounce (only disappear in destination zone)

### Pause Behavior
- All balls freeze in place
- Ball positions preserved exactly
- Physics resume on unpause
- **User can still place, move, rotate, and delete shapes while paused**

---

## Statistics

### Session Stats (Reset via Reset button)
- Balls dropped this session
- Balls delivered this session (Challenge mode)
- Shapes placed this session

### Lifetime Stats (Persist in localStorage)
- Total play time (wall clock)
- Total balls dropped (all time)
- Total balls delivered (all time, Challenge mode)
- Total shapes placed (all time)

### Display
- Stats bar below game window
- Creative mode: Shows balls dropped (displayed twice as placeholder for challenge stats)
- Challenge mode: Shows balls dropped AND balls delivered

---

## Screens

### Onboarding Overlay (First Launch / New Session)
Displayed on game start. Can be skipped after first visit.

**Contents:**
- Game title and brief description
- "Redirect falling balls using your imagination!"
- Input: Player name
- Selection: Game mode (Creative / Challenge)
- Selection: Theme (Light / Dark)
- "Start" button

**Persistence:**
- Player name saved to localStorage
- Preferences remembered for future sessions
- "Skip intro" option after first visit

### Settings Screen (Escape key or Gear button)
Accessible anytime via Escape key OR Settings gear button in toolbar.

**Contents:**
- Player name (editable)
- Theme toggle (Light / Dark)
- Ball spawn rate slider (Creative mode only)
- Lifetime statistics display
- "Reset All Data" button (clears localStorage completely - saves, stats, preferences)
- "Close" button

---

## Save/Load System

### Save
- Triggered by Save button in toolbar
- Serializes complete game state to JSON
- Prompts filename input
- Downloads JSON file to user's computer

### Load
- Triggered by Load button in toolbar
- Opens file picker for JSON files
- Parses and validates JSON
- Restores game state from file
- Handles errors gracefully (invalid file, corrupted data)

### Saved State Includes
- All placed shapes (type, position, rotation)
- All active balls (position, velocity)
- Current game mode
- Session statistics
- Pause state

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Toggle Play/Pause |
| Escape | Open/Close Settings |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Enter Delete mode |

---

## Future Considerations (Out of Scope for Initial Build)

### Stubbed for Later
- Sound effects (bounce, place, UI clicks)
- Challenge mode levels and progression
- Mobile/touch support
- Grid snapping toggle
- Shape duplication
- Curved pieces (arcs, half-pipes)

### Technical Debt to Address
- Responsive design for various screen sizes
- Performance optimization for many balls/shapes
- Accessibility features
- Localization support

---

## Implementation Notes

### Physics Engine Decision
**Option A: Matter.js**
- Pros: Handles collision detection, bouncing, gravity automatically
- Pros: Well-documented, widely used
- Cons: Additional dependency, learning curve

**Option B: Custom Physics**
- Pros: Full control, no dependencies
- Pros: Educational value
- Cons: More complex to implement correctly
- Cons: Edge cases in collision detection

**Recommendation**: Start with Matter.js for rapid prototyping. Can replace with custom implementation later if needed.

### State Management
- Use React Context or Zustand for global state
- Separate concerns: UI state vs. game/physics state
- Undo/Redo: Implement command pattern or state snapshots

### Canvas Rendering
- Use HTML5 Canvas for game window
- React handles toolbar and UI components
- Consider requestAnimationFrame for smooth physics loop

---

## File Structure (Suggested)

```
src/
  components/
    Toolbar/
    GameCanvas/
    StatsBar/
    Onboarding/
    Settings/
  hooks/
    usePhysics.ts
    useGameState.ts
    useUndo.ts
  types/
    shapes.ts
    game.ts
    physics.ts
  themes/
    light.ts
    dark.ts
  utils/
    saveLoad.ts
    physics.ts
  constants/
    shapes.ts
    colors.ts
  App.tsx
  index.tsx
```

---

## Acceptance Criteria Summary

### Core Gameplay
1. Balls drop from top-left area (25% from left edge) and fall with gravity
2. Balls bounce off walls (top, left, right) and shapes with 0.8 restitution
3. Balls disappear at bottom (Creative) or destination (Challenge)
4. Maximum 1024 balls on screen simultaneously
5. Ball spawn rate configurable: 0.25s to 10s interval (Creative mode)

### Shapes
6. 5 shape types placeable via toolbar (3 lines, 2 squares)
7. Maximum 256 shapes on screen simultaneously
8. All dimensions relative to canvas size (see Dimensions section)
9. Shapes appear in center of canvas when selected from toolbar
10. Shapes draggable and rotatable (scroll wheel) in both paused and live mode

### Controls
11. Play/Pause freezes ball physics but allows shape manipulation
12. Settings accessible via gear button OR Escape key
13. Save exports JSON file download, Load imports JSON file
14. Undo/Redo for shape actions
15. Delete mode for removing shapes
16. Clear removes balls only
17. Reset removes balls + shapes + session stats

### UI/UX
18. Canvas size: 1600x900 pixels
19. Two visual themes switchable in settings (Light/Dark)
20. Onboarding collects name, mode, theme
21. Stats tracked and displayed in stats bar
22. Windows XP aesthetic throughout UI (gradients, 3D buttons)
