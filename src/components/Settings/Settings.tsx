import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { MIN_SPAWN_RATE, MAX_SPAWN_RATE } from '../../types/game';
import type { Theme } from '../../types/game';
import packageJson from '../../../package.json';
import './Settings.css';

const APP_VERSION = packageJson.version;
const GITHUB_URL = 'https://github.com/abramjstamper/assemble-game';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function SettingsContent() {
  const { state, showSettings, setTheme, setSpawnRate, resetAllData, dispatch } = useGameState();
  const [name, setName] = useState(state.player.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleClose = () => {
    // Save name if changed
    if (name !== state.player.name) {
      dispatch({ type: 'SET_PLAYER_DATA', payload: { name } });
    }
    showSettings(false);
  };

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const handleSpawnRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSpawnRate(value);
  };

  const handleResetAllData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllData();
    setConfirmReset(false);
    showSettings(false);
  };

  return (
    <div className={`settings-overlay theme-${state.theme}`} onClick={handleClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Player</h3>
            <div className="form-group">
              <label htmlFor="settings-name">Name</label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="form-group">
              <label>Theme</label>
              <div className="theme-toggle">
                <button
                  className={`theme-option ${state.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  &#9728; Whimsical
                </button>
                <button
                  className={`theme-option ${state.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  &#127769; Blacklight
                </button>
              </div>
            </div>
          </div>

          {state.mode === 'creative' && (
            <div className="settings-section">
              <h3>Gameplay</h3>
              <div className="form-group">
                <label htmlFor="spawn-rate">
                  Ball Spawn Rate: <strong>{state.spawnRate.toFixed(2)}s</strong>
                </label>
                <div className="slider-container">
                  <span className="slider-label">Fast</span>
                  <input
                    id="spawn-rate"
                    type="range"
                    min={MIN_SPAWN_RATE}
                    max={MAX_SPAWN_RATE}
                    step={0.1}
                    value={state.spawnRate}
                    onChange={handleSpawnRateChange}
                  />
                  <span className="slider-label">Slow</span>
                </div>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h3>Lifetime Statistics</h3>
            <div className="stats-grid">
              <div className="stat-row">
                <span className="stat-label">Total Play Time:</span>
                <span className="stat-value">{formatTime(state.lifetimeStats.totalPlayTime)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Balls Dropped:</span>
                <span className="stat-value">{state.lifetimeStats.totalBallsDropped.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Shapes Placed:</span>
                <span className="stat-value">{state.lifetimeStats.totalShapesPlaced.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <h3>Danger Zone</h3>
            <button
              className={`reset-button ${confirmReset ? 'confirm' : ''}`}
              onClick={handleResetAllData}
            >
              {confirmReset ? 'Click again to confirm reset' : 'Reset All Data'}
            </button>
            <p className="danger-warning">
              This will clear all saves, statistics, and preferences.
            </p>
          </div>

          <div className="settings-section about-section">
            <h3>About</h3>
            <div className="about-info">
              <span className="version">Assemble v{APP_VERSION}</span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that remounts SettingsContent when opened
// This ensures fresh state initialization each time settings open
export function Settings() {
  const { state } = useGameState();

  if (!state.showSettings) return null;

  // Key forces remount when settings reopen, giving fresh initial state
  return <SettingsContent key="settings" />;
}
