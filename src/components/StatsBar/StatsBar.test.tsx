import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from './StatsBar';
import { GameProvider } from '../../hooks/useGameState';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<GameProvider>{ui}</GameProvider>);
};

describe('StatsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render session stats section', () => {
    renderWithProvider(<StatsBar />);

    expect(screen.getByText('Session:')).toBeInTheDocument();
    expect(screen.getByText('balls dropped')).toBeInTheDocument();
    expect(screen.getByText('shapes placed')).toBeInTheDocument();
  });

  it('should render active counts section', () => {
    renderWithProvider(<StatsBar />);

    expect(screen.getByText('Active:')).toBeInTheDocument();
    expect(screen.getByText('balls')).toBeInTheDocument();
    expect(screen.getByText('shapes')).toBeInTheDocument();
  });

  it('should render player info', () => {
    renderWithProvider(<StatsBar />);

    expect(screen.getByText('Player:')).toBeInTheDocument();
    expect(screen.getByText('Total time:')).toBeInTheDocument();
  });

  it('should show Guest when no player name set', () => {
    renderWithProvider(<StatsBar />);

    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('should display initial stat values as 0', () => {
    renderWithProvider(<StatsBar />);

    // Find all stat values that are 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('should apply correct theme class', () => {
    const { container } = renderWithProvider(<StatsBar />);

    const statsBar = container.querySelector('.stats-bar');
    expect(statsBar).toHaveClass('theme-light');
  });
});
