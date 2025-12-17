import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';
import { GameProvider, useGameState } from '../../hooks/useGameState';
import type { ReactNode } from 'react';

// Component to open settings
function SettingsOpener({ children }: { children: ReactNode }) {
  const { showSettings } = useGameState();

  return (
    <>
      <button onClick={() => showSettings(true)}>Open Settings</button>
      {children}
    </>
  );
}

const renderWithProvider = () => {
  return render(
    <GameProvider>
      <SettingsOpener>
        <Settings />
      </SettingsOpener>
    </GameProvider>
  );
};

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not render when showSettings is false', () => {
    render(
      <GameProvider>
        <Settings />
      </GameProvider>
    );

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should render when showSettings is true', () => {
    renderWithProvider();

    // Open settings
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should have player name input', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('should have theme toggle buttons', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByText(/Whimsical/)).toBeInTheDocument();
    expect(screen.getByText(/Blacklight/)).toBeInTheDocument();
  });

  it('should have spawn rate slider', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByText(/Ball Spawn Rate/)).toBeInTheDocument();
  });

  it('should display lifetime statistics', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByText('Lifetime Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Play Time:')).toBeInTheDocument();
    expect(screen.getByText('Total Balls Dropped:')).toBeInTheDocument();
    expect(screen.getByText('Total Shapes Placed:')).toBeInTheDocument();
  });

  it('should have danger zone with reset button', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    expect(screen.getByText('Reset All Data')).toBeInTheDocument();
  });

  it('should have close button', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    const closeButton = screen.getByText('×');
    expect(closeButton).toBeInTheDocument();
  });

  it('should close when close button clicked', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('×'));

    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('should close when clicking overlay', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    const overlay = document.querySelector('.settings-overlay');
    fireEvent.click(overlay!);

    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('should require confirmation for reset', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('Open Settings'));

    const resetButton = screen.getByText('Reset All Data');
    fireEvent.click(resetButton);

    // Should show confirmation text
    expect(screen.getByText(/Click again to confirm/)).toBeInTheDocument();
  });
});
