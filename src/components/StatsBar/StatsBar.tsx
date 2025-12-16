import { useGameState } from '../../hooks/useGameState';
import './StatsBar.css';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function StatsBar() {
  const { state } = useGameState();

  return (
    <div className={`stats-bar theme-${state.theme}`}>
      <div className="stats-section">
        <span className="stats-label">Session:</span>
        <div className="stat-item">
          <span className="stat-value">{state.sessionStats.ballsDropped}</span>
          <span className="stat-name">balls dropped</span>
        </div>
        {state.mode === 'challenge' && (
          <div className="stat-item">
            <span className="stat-value">{state.sessionStats.ballsDelivered}</span>
            <span className="stat-name">delivered</span>
          </div>
        )}
        <div className="stat-item">
          <span className="stat-value">{state.sessionStats.shapesPlaced}</span>
          <span className="stat-name">shapes placed</span>
        </div>
      </div>

      <div className="stats-divider" />

      <div className="stats-section">
        <span className="stats-label">Active:</span>
        <div className="stat-item">
          <span className="stat-value">{state.balls.length}</span>
          <span className="stat-name">balls</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{state.shapes.length}</span>
          <span className="stat-name">shapes</span>
        </div>
      </div>

      <div className="stats-spacer" />

      <div className="stats-section stats-right">
        <div className="stat-item">
          <span className="stat-name">Player:</span>
          <span className="stat-value player-name">{state.player.name || 'Guest'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name">Total time:</span>
          <span className="stat-value">{formatTime(state.lifetimeStats.totalPlayTime)}</span>
        </div>
      </div>
    </div>
  );
}
