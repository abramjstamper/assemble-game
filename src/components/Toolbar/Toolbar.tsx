import { useRef, type ReactNode, type ChangeEvent } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { getShapeColor } from '../../constants/colors';
import { MAX_SHAPES } from '../../types/game';
import './Toolbar.css';

// SVG Icons as components
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const LoadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

const UndoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);

const RedoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" transform="translate(2,2) scale(0.6)" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

// Shape icons
const ShortLineIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24">
    <rect x="6" y="10" width="12" height="4" rx="1" fill={color} />
    <circle cx="6" cy="12" r="2" fill={color} />
    <circle cx="18" cy="12" r="2" fill={color} />
  </svg>
);

const MediumLineIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="10" width="18" height="4" rx="1" fill={color} />
    <circle cx="3" cy="12" r="2" fill={color} />
    <circle cx="21" cy="12" r="2" fill={color} />
  </svg>
);

const LongLineIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24">
    <rect x="1" y="10" width="22" height="4" rx="1" fill={color} />
    <circle cx="1" cy="12" r="2" fill={color} />
    <circle cx="23" cy="12" r="2" fill={color} />
  </svg>
);

const SmallSquareIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24">
    <rect x="7" y="7" width="10" height="10" rx="1" fill={color} />
  </svg>
);

const LargeSquareIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="1" fill={color} />
  </svg>
);

interface ToolbarButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

function ToolbarButton({ icon, tooltip, onClick, active, disabled, className }: ToolbarButtonProps) {
  return (
    <button
      className={`toolbar-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="toolbar-separator" />;
}

export function Toolbar() {
  const { state, togglePause, setTool, showSettings, resetSession } = useGameState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddShapes = state.shapes.length < MAX_SHAPES;

  const handleSave = () => {
    const saveData = {
      version: 1,
      shapes: state.shapes,
      balls: state.balls,
      mode: state.mode,
      sessionStats: state.sessionStats,
      isPaused: state.isPaused,
      spawnRate: state.spawnRate,
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assemble-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate save data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid save data');
        }

        // Load the state using the game's load function
        window.__gameLoadState?.({
          shapes: Array.isArray(data.shapes) ? data.shapes : [],
          spawnRate: typeof data.spawnRate === 'number' ? data.spawnRate : undefined,
          mode: data.mode,
        });
      } catch {
        alert('Failed to load save file. Invalid format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUndo = () => {
    window.__gameUndo?.();
  };

  const handleRedo = () => {
    window.__gameRedo?.();
  };

  const handleClear = () => {
    window.__gameClearBalls?.();
  };

  const handleReset = () => {
    window.__gameReset?.();
    resetSession();
  };

  return (
    <div className={`toolbar theme-${state.theme}`}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />

      {/* Game Controls */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={state.isPaused ? <PlayIcon /> : <PauseIcon />}
          tooltip={`${state.isPaused ? 'Play' : 'Pause'} (Space)`}
          onClick={togglePause}
        />
        <ToolbarButton
          icon={<SettingsIcon />}
          tooltip="Settings (Escape)"
          onClick={() => showSettings(true)}
        />
      </div>

      <ToolbarSeparator />

      {/* Save/Load */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={<SaveIcon />}
          tooltip="Save game to file"
          onClick={handleSave}
        />
        <ToolbarButton
          icon={<LoadIcon />}
          tooltip="Load saved game"
          onClick={handleLoad}
        />
      </div>

      <ToolbarSeparator />

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={<UndoIcon />}
          tooltip="Undo (Ctrl+Z)"
          onClick={handleUndo}
        />
        <ToolbarButton
          icon={<RedoIcon />}
          tooltip="Redo (Ctrl+Y)"
          onClick={handleRedo}
        />
      </div>

      <ToolbarSeparator />

      {/* Shape Tools */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={<ShortLineIcon color={getShapeColor('shortLine', state.theme)} />}
          tooltip="Short ramp - click to place"
          onClick={() => setTool('shortLine')}
          active={state.currentTool === 'shortLine'}
          disabled={!canAddShapes}
        />
        <ToolbarButton
          icon={<MediumLineIcon color={getShapeColor('mediumLine', state.theme)} />}
          tooltip="Medium ramp - click to place"
          onClick={() => setTool('mediumLine')}
          active={state.currentTool === 'mediumLine'}
          disabled={!canAddShapes}
        />
        <ToolbarButton
          icon={<LongLineIcon color={getShapeColor('longLine', state.theme)} />}
          tooltip="Long ramp - click to place"
          onClick={() => setTool('longLine')}
          active={state.currentTool === 'longLine'}
          disabled={!canAddShapes}
        />
        <ToolbarButton
          icon={<SmallSquareIcon color={getShapeColor('smallSquare', state.theme)} />}
          tooltip="Small block - click to place"
          onClick={() => setTool('smallSquare')}
          active={state.currentTool === 'smallSquare'}
          disabled={!canAddShapes}
        />
        <ToolbarButton
          icon={<LargeSquareIcon color={getShapeColor('largeSquare', state.theme)} />}
          tooltip="Large block - click to place"
          onClick={() => setTool('largeSquare')}
          active={state.currentTool === 'largeSquare'}
          disabled={!canAddShapes}
        />
      </div>

      <ToolbarSeparator />

      {/* Destructive Actions */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={<DeleteIcon />}
          tooltip="Delete mode - click shape to remove"
          onClick={() => setTool(state.currentTool === 'delete' ? 'select' : 'delete')}
          active={state.currentTool === 'delete'}
          className="destructive"
        />
        <ToolbarButton
          icon={<ClearIcon />}
          tooltip="Clear all balls"
          onClick={handleClear}
          className="destructive"
        />
        <ToolbarButton
          icon={<ResetIcon />}
          tooltip="Reset session"
          onClick={handleReset}
          className="destructive"
        />
      </div>
    </div>
  );
}
