import { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import type { GameMode, Theme } from '../../types/game';
import './Onboarding.css';

export function Onboarding() {
  const { state, completeOnboarding } = useGameState();
  const [name, setName] = useState(state.player.name || '');
  const [mode, setMode] = useState<GameMode>('creative');
  const [theme, setTheme] = useState<Theme>(state.theme);

  if (!state.showOnboarding) return null;

  const handleStart = () => {
    completeOnboarding(name || 'Player', mode, theme);
  };

  return (
    <div className={`onboarding-overlay theme-${theme}`}>
      <div className="onboarding-panel">
        <h1 className="onboarding-title">Assemble</h1>
        <p className="onboarding-subtitle">Redirect falling balls using your imagination!</p>

        <div className="how-to-play">
          <h2>How to Play</h2>
          <ul>
            <li><span className="step-icon">&#9679;</span> Balls spawn automatically from the top</li>
            <li><span className="step-icon">&#128736;</span> Select a shape from the toolbar, then click to place it</li>
            <li><span className="step-icon">&#128070;</span> Drag shapes to move them</li>
            <li><span className="step-icon">&#128260;</span> Scroll wheel or pinch to rotate shapes</li>
            <li><span className="step-icon">&#128465;</span> Use delete mode or double-click to remove shapes</li>
          </ul>
        </div>

        <div className="onboarding-form">
          <div className="form-group">
            <label htmlFor="player-name">Your Name</label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>Game Mode</label>
            <div className="button-group">
              <button
                className={`mode-button ${mode === 'creative' ? 'active' : ''}`}
                onClick={() => setMode('creative')}
              >
                <span className="mode-icon">&#127912;</span>
                <span className="mode-name">Creative</span>
                <span className="mode-desc">Freeform sandbox</span>
              </button>
              <button
                className={`mode-button ${mode === 'challenge' ? 'active' : ''}`}
                onClick={() => setMode('challenge')}
                disabled
              >
                <span className="mode-icon">&#127942;</span>
                <span className="mode-name">Challenge</span>
                <span className="mode-desc">Coming Soon</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <div className="button-group">
              <button
                className={`theme-button light ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <span className="theme-icon">&#9728;</span>
                <span className="theme-name">Whimsical</span>
              </button>
              <button
                className={`theme-button dark ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <span className="theme-icon">&#127769;</span>
                <span className="theme-name">Blacklight</span>
              </button>
            </div>
          </div>

          <button className="start-button" onClick={handleStart}>
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
