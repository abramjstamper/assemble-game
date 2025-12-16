import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { GameProvider } from '../../hooks/useGameState';

// Wrapper component
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<GameProvider>{ui}</GameProvider>);
};

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render all toolbar buttons', () => {
    renderWithProvider(<Toolbar />);

    // Game controls
    expect(screen.getByTitle(/Play|Pause/)).toBeInTheDocument();
    expect(screen.getByTitle(/Settings/)).toBeInTheDocument();

    // Save/Load
    expect(screen.getByTitle(/Save game/)).toBeInTheDocument();
    expect(screen.getByTitle(/Load saved/)).toBeInTheDocument();

    // Undo/Redo
    expect(screen.getByTitle(/Undo/)).toBeInTheDocument();
    expect(screen.getByTitle(/Redo/)).toBeInTheDocument();

    // Shape tools
    expect(screen.getByTitle(/Short ramp/)).toBeInTheDocument();
    expect(screen.getByTitle(/Medium ramp/)).toBeInTheDocument();
    expect(screen.getByTitle(/Long ramp/)).toBeInTheDocument();
    expect(screen.getByTitle(/Small block/)).toBeInTheDocument();
    expect(screen.getByTitle(/Large block/)).toBeInTheDocument();

    // Destructive actions
    expect(screen.getByTitle(/Delete mode/)).toBeInTheDocument();
    expect(screen.getByTitle(/Clear all balls/)).toBeInTheDocument();
    expect(screen.getByTitle(/Reset session/)).toBeInTheDocument();
  });

  it('should show Play icon when paused', () => {
    renderWithProvider(<Toolbar />);

    const playPauseButton = screen.getByTitle(/Play.*Space/);
    expect(playPauseButton).toBeInTheDocument();
  });

  it('should toggle between shape tools', () => {
    renderWithProvider(<Toolbar />);

    const shortLineButton = screen.getByTitle(/Short ramp/);
    const mediumLineButton = screen.getByTitle(/Medium ramp/);

    // Click short line
    fireEvent.click(shortLineButton);
    expect(shortLineButton).toHaveClass('active');

    // Click medium line
    fireEvent.click(mediumLineButton);
    expect(mediumLineButton).toHaveClass('active');
  });

  it('should toggle delete mode', () => {
    renderWithProvider(<Toolbar />);

    const deleteButton = screen.getByTitle(/Delete mode/);

    fireEvent.click(deleteButton);
    expect(deleteButton).toHaveClass('active');

    fireEvent.click(deleteButton);
    expect(deleteButton).not.toHaveClass('active');
  });

  it('should have hidden file input for load', () => {
    renderWithProvider(<Toolbar />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveStyle({ display: 'none' });
  });

  it('should call global undo function when undo clicked', () => {
    const mockUndo = vi.fn();
    (window as any).__gameUndo = mockUndo;

    renderWithProvider(<Toolbar />);

    const undoButton = screen.getByTitle(/Undo/);
    fireEvent.click(undoButton);

    expect(mockUndo).toHaveBeenCalled();

    delete (window as any).__gameUndo;
  });

  it('should call global redo function when redo clicked', () => {
    const mockRedo = vi.fn();
    (window as any).__gameRedo = mockRedo;

    renderWithProvider(<Toolbar />);

    const redoButton = screen.getByTitle(/Redo/);
    fireEvent.click(redoButton);

    expect(mockRedo).toHaveBeenCalled();

    delete (window as any).__gameRedo;
  });

  it('should call global clear function when clear balls clicked', () => {
    const mockClear = vi.fn();
    (window as any).__gameClearBalls = mockClear;

    renderWithProvider(<Toolbar />);

    const clearButton = screen.getByTitle(/Clear all balls/);
    fireEvent.click(clearButton);

    expect(mockClear).toHaveBeenCalled();

    delete (window as any).__gameClearBalls;
  });

  it('should call global reset function when reset clicked', () => {
    const mockReset = vi.fn();
    (window as any).__gameReset = mockReset;

    renderWithProvider(<Toolbar />);

    const resetButton = screen.getByTitle(/Reset session/);
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalled();

    delete (window as any).__gameReset;
  });
});
