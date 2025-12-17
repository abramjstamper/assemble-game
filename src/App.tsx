import { useEffect } from 'react';
import { GameProvider, useGameState } from './hooks/useGameState';
import { GameCanvas } from './components/GameCanvas';
import { Toolbar } from './components/Toolbar';
import { StatsBar } from './components/StatsBar';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import './App.css';

function GameApp() {
  const { state, togglePause, showSettings, setTool } = useGameState();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'Escape':
          e.preventDefault();
          if (state.showSettings) {
            showSettings(false);
          } else {
            showSettings(true);
          }
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.__gameUndo?.();
          }
          break;
        case 'y':
        case 'Y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.__gameRedo?.();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setTool(state.currentTool === 'delete' ? 'select' : 'delete');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, showSettings, setTool, state.showSettings, state.currentTool]);

  return (
    <div className={`app theme-${state.theme}`}>
      <Toolbar />
      <main className="game-area">
        <GameCanvas />
      </main>
      <StatsBar />
      <Onboarding />
      <Settings />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;
