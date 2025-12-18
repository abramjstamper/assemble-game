import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Onboarding } from './Onboarding';
import { GameProvider } from '../../hooks/useGameState';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<GameProvider>{ui}</GameProvider>);
};

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render onboarding screen for new users', () => {
    renderWithProvider(<Onboarding />);

    expect(screen.getByText('Assemble')).toBeInTheDocument();
    expect(screen.getByText(/Redirect falling balls/)).toBeInTheDocument();
  });

  it('should have name input field', () => {
    renderWithProvider(<Onboarding />);

    const nameInput = screen.getByPlaceholderText(/Enter your name/);
    expect(nameInput).toBeInTheDocument();
  });

  it('should have game mode selection', () => {
    renderWithProvider(<Onboarding />);

    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Challenge')).toBeInTheDocument();
  });

  it('should have theme selection', () => {
    renderWithProvider(<Onboarding />);

    expect(screen.getByText('Whimsical')).toBeInTheDocument();
    expect(screen.getByText('Blacklight')).toBeInTheDocument();
  });

  it('should have start button', () => {
    renderWithProvider(<Onboarding />);

    expect(screen.getByText('Start Playing')).toBeInTheDocument();
  });

  it('should allow entering player name', () => {
    renderWithProvider(<Onboarding />);

    const nameInput = screen.getByPlaceholderText(/Enter your name/) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });

    expect(nameInput.value).toBe('TestPlayer');
  });

  it('should have Creative mode selected by default', () => {
    renderWithProvider(<Onboarding />);

    const creativeButton = screen.getByText('Creative').closest('button');
    expect(creativeButton).toHaveClass('active');
  });

  it('should disable Challenge mode (coming soon)', () => {
    renderWithProvider(<Onboarding />);

    const challengeButton = screen.getByText('Challenge').closest('button');
    expect(challengeButton).toBeDisabled();
  });

  it('should allow selecting theme', () => {
    renderWithProvider(<Onboarding />);

    const darkButton = screen.getByText('Blacklight').closest('button');
    fireEvent.click(darkButton!);

    expect(darkButton).toHaveClass('active');
  });

  it('should display How to Play instructions', () => {
    renderWithProvider(<Onboarding />);

    expect(screen.getByText('How to Play')).toBeInTheDocument();
    expect(screen.getByText(/Balls spawn automatically/)).toBeInTheDocument();
    expect(screen.getByText(/Select a shape from the toolbar/)).toBeInTheDocument();
    expect(screen.getByText(/Drag shapes to move/)).toBeInTheDocument();
    expect(screen.getByText(/Scroll wheel to rotate/)).toBeInTheDocument();
    expect(screen.getByText(/delete mode or double-tap/)).toBeInTheDocument();
  });
});
