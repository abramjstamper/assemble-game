import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameMode, Theme, ToolMode, SessionStats, LifetimeStats, PlayerData, Ball } from '../types/game';
import type { Shape, ShapeType } from '../types/shapes';
import { SHAPE_CONFIGS } from '../types/shapes';
import { DEFAULT_SPAWN_RATE } from '../types/game';

// Storage keys
const STORAGE_KEYS = {
  LIFETIME_STATS: 'assemble_lifetime_stats',
  PLAYER_DATA: 'assemble_player_data',
  PREFERENCES: 'assemble_preferences',
};

// Initial values
const initialSessionStats: SessionStats = {
  ballsDropped: 0,
  ballsDelivered: 0,
  shapesPlaced: 0,
};

const initialLifetimeStats: LifetimeStats = {
  totalPlayTime: 0,
  totalBallsDropped: 0,
  totalBallsDelivered: 0,
  totalShapesPlaced: 0,
};

const initialPlayerData: PlayerData = {
  name: '',
  hasCompletedOnboarding: false,
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Load initial state
const loadInitialState = (): GameState => {
  const playerData = loadFromStorage(STORAGE_KEYS.PLAYER_DATA, initialPlayerData);
  const lifetimeStats = loadFromStorage(STORAGE_KEYS.LIFETIME_STATS, initialLifetimeStats);
  const preferences = loadFromStorage(STORAGE_KEYS.PREFERENCES, { theme: 'light' as Theme, spawnRate: DEFAULT_SPAWN_RATE });

  return {
    player: playerData,
    mode: 'creative',
    theme: preferences.theme,
    isPaused: true,
    spawnRate: preferences.spawnRate,
    currentTool: 'select',
    selectedShapeId: null,
    shapes: [],
    balls: [],
    sessionStats: { ...initialSessionStats },
    lifetimeStats,
    showSettings: false,
    showOnboarding: !playerData.hasCompletedOnboarding,
  };
};

// Action types
type GameAction =
  | { type: 'SET_PLAYER_DATA'; payload: Partial<PlayerData> }
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_SPAWN_RATE'; payload: number }
  | { type: 'SET_TOOL'; payload: ToolMode }
  | { type: 'SELECT_SHAPE'; payload: string | null }
  | { type: 'ADD_SHAPE'; payload: Shape }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; updates: Partial<Shape> } }
  | { type: 'DELETE_SHAPE'; payload: string }
  | { type: 'SET_SHAPES'; payload: Shape[] }
  | { type: 'ADD_BALL'; payload: Ball }
  | { type: 'REMOVE_BALL'; payload: string }
  | { type: 'SET_BALLS'; payload: Ball[] }
  | { type: 'CLEAR_BALLS' }
  | { type: 'INCREMENT_BALLS_DROPPED' }
  | { type: 'INCREMENT_BALLS_DELIVERED' }
  | { type: 'RESET_SESSION' }
  | { type: 'SHOW_SETTINGS'; payload: boolean }
  | { type: 'SHOW_ONBOARDING'; payload: boolean }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'UPDATE_LIFETIME_STATS'; payload: Partial<LifetimeStats> }
  | { type: 'RESET_ALL_DATA' }
  | { type: 'LOAD_STATE'; payload: Partial<GameState> };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_DATA': {
      const newPlayerData = { ...state.player, ...action.payload };
      saveToStorage(STORAGE_KEYS.PLAYER_DATA, newPlayerData);
      return { ...state, player: newPlayerData };
    }

    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_THEME': {
      const preferences = loadFromStorage(STORAGE_KEYS.PREFERENCES, { theme: state.theme, spawnRate: state.spawnRate });
      saveToStorage(STORAGE_KEYS.PREFERENCES, { ...preferences, theme: action.payload });
      return { ...state, theme: action.payload };
    }

    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };

    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };

    case 'SET_SPAWN_RATE': {
      const preferences = loadFromStorage(STORAGE_KEYS.PREFERENCES, { theme: state.theme, spawnRate: state.spawnRate });
      saveToStorage(STORAGE_KEYS.PREFERENCES, { ...preferences, spawnRate: action.payload });
      return { ...state, spawnRate: action.payload };
    }

    case 'SET_TOOL':
      return { ...state, currentTool: action.payload, selectedShapeId: null };

    case 'SELECT_SHAPE':
      return { ...state, selectedShapeId: action.payload };

    case 'ADD_SHAPE': {
      const newStats = {
        ...state.sessionStats,
        shapesPlaced: state.sessionStats.shapesPlaced + 1,
      };
      const newLifetimeStats = {
        ...state.lifetimeStats,
        totalShapesPlaced: state.lifetimeStats.totalShapesPlaced + 1,
      };
      saveToStorage(STORAGE_KEYS.LIFETIME_STATS, newLifetimeStats);
      return {
        ...state,
        shapes: [...state.shapes, action.payload],
        sessionStats: newStats,
        lifetimeStats: newLifetimeStats,
      };
    }

    case 'UPDATE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };

    case 'DELETE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.filter(s => s.id !== action.payload),
        selectedShapeId: state.selectedShapeId === action.payload ? null : state.selectedShapeId,
      };

    case 'SET_SHAPES':
      return { ...state, shapes: action.payload };

    case 'ADD_BALL':
      return { ...state, balls: [...state.balls, action.payload] };

    case 'REMOVE_BALL':
      return { ...state, balls: state.balls.filter(b => b.id !== action.payload) };

    case 'SET_BALLS':
      return { ...state, balls: action.payload };

    case 'CLEAR_BALLS':
      return { ...state, balls: [] };

    case 'INCREMENT_BALLS_DROPPED': {
      const newStats = {
        ...state.sessionStats,
        ballsDropped: state.sessionStats.ballsDropped + 1,
      };
      const newLifetimeStats = {
        ...state.lifetimeStats,
        totalBallsDropped: state.lifetimeStats.totalBallsDropped + 1,
      };
      saveToStorage(STORAGE_KEYS.LIFETIME_STATS, newLifetimeStats);
      return { ...state, sessionStats: newStats, lifetimeStats: newLifetimeStats };
    }

    case 'INCREMENT_BALLS_DELIVERED': {
      const newStats = {
        ...state.sessionStats,
        ballsDelivered: state.sessionStats.ballsDelivered + 1,
      };
      const newLifetimeStats = {
        ...state.lifetimeStats,
        totalBallsDelivered: state.lifetimeStats.totalBallsDelivered + 1,
      };
      saveToStorage(STORAGE_KEYS.LIFETIME_STATS, newLifetimeStats);
      return { ...state, sessionStats: newStats, lifetimeStats: newLifetimeStats };
    }

    case 'RESET_SESSION':
      return {
        ...state,
        shapes: [],
        balls: [],
        sessionStats: { ...initialSessionStats },
        selectedShapeId: null,
        currentTool: 'select',
      };

    case 'SHOW_SETTINGS':
      return { ...state, showSettings: action.payload };

    case 'SHOW_ONBOARDING':
      return { ...state, showOnboarding: action.payload };

    case 'COMPLETE_ONBOARDING': {
      const newPlayerData = { ...state.player, hasCompletedOnboarding: true };
      saveToStorage(STORAGE_KEYS.PLAYER_DATA, newPlayerData);
      return { ...state, player: newPlayerData, showOnboarding: false };
    }

    case 'UPDATE_LIFETIME_STATS': {
      const newLifetimeStats = { ...state.lifetimeStats, ...action.payload };
      saveToStorage(STORAGE_KEYS.LIFETIME_STATS, newLifetimeStats);
      return { ...state, lifetimeStats: newLifetimeStats };
    }

    case 'RESET_ALL_DATA':
      localStorage.removeItem(STORAGE_KEYS.LIFETIME_STATS);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      return loadInitialState();

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// Context
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Convenience actions
  togglePause: () => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: GameMode) => void;
  setTool: (tool: ToolMode) => void;
  addShape: (type: ShapeType) => Shape;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  addBall: (ball: Ball) => void;
  removeBall: (id: string) => void;
  clearBalls: () => void;
  incrementBallsDropped: () => void;
  resetSession: () => void;
  showSettings: (show: boolean) => void;
  completeOnboarding: (name: string, mode: GameMode, theme: Theme) => void;
  setSpawnRate: (rate: number) => void;
  resetAllData: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, loadInitialState);

  // Track play time - initialize in effect to avoid impure function in render
  const lastTickRef = useRef<number | null>(null);
  useEffect(() => {
    if (state.isPaused) {
      lastTickRef.current = null;
      return;
    }

    // Initialize timestamp when unpaused
    if (lastTickRef.current === null) {
      lastTickRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;

      dispatch({
        type: 'UPDATE_LIFETIME_STATS',
        payload: { totalPlayTime: state.lifetimeStats.totalPlayTime + elapsed },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isPaused, state.lifetimeStats.totalPlayTime]);

  // Convenience action creators
  const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);
  const setTheme = useCallback((theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }), []);
  const setMode = useCallback((mode: GameMode) => dispatch({ type: 'SET_MODE', payload: mode }), []);
  const setTool = useCallback((tool: ToolMode) => dispatch({ type: 'SET_TOOL', payload: tool }), []);

  const addShape = useCallback((type: ShapeType): Shape => {
    const config = SHAPE_CONFIGS[type];
    // Give lines a small initial angle so balls roll off
    // Randomly tilt left or right by ~5 degrees (0.087 radians)
    const initialRotation = config.isLine
      ? (Math.random() > 0.5 ? 0.087 : -0.087)
      : 0;

    const shape: Shape = {
      id: generateId(),
      type,
      x: 800, // Center of canvas
      y: 450,
      rotation: initialRotation,
    };
    dispatch({ type: 'ADD_SHAPE', payload: shape });
    return shape;
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates } });
  }, []);

  const deleteShape = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SHAPE', payload: id });
  }, []);

  const selectShape = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_SHAPE', payload: id });
  }, []);

  const addBall = useCallback((ball: Ball) => {
    dispatch({ type: 'ADD_BALL', payload: ball });
  }, []);

  const removeBall = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_BALL', payload: id });
  }, []);

  const clearBalls = useCallback(() => {
    dispatch({ type: 'CLEAR_BALLS' });
  }, []);

  const incrementBallsDropped = useCallback(() => {
    dispatch({ type: 'INCREMENT_BALLS_DROPPED' });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const showSettings = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_SETTINGS', payload: show });
  }, []);

  const completeOnboarding = useCallback((name: string, mode: GameMode, theme: Theme) => {
    dispatch({ type: 'SET_PLAYER_DATA', payload: { name } });
    dispatch({ type: 'SET_MODE', payload: mode });
    dispatch({ type: 'SET_THEME', payload: theme });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const setSpawnRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_SPAWN_RATE', payload: rate });
  }, []);

  const resetAllData = useCallback(() => {
    dispatch({ type: 'RESET_ALL_DATA' });
  }, []);

  const value: GameContextValue = {
    state,
    dispatch,
    togglePause,
    setTheme,
    setMode,
    setTool,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    addBall,
    removeBall,
    clearBalls,
    incrementBallsDropped,
    resetSession,
    showSettings,
    completeOnboarding,
    setSpawnRate,
    resetAllData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook to use game state
// eslint-disable-next-line react-refresh/only-export-components
export function useGameState(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
