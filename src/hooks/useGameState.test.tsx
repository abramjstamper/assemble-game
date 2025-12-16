import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, useGameState } from './useGameState';
import type { ReactNode } from 'react';

// Wrapper component for the hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

describe('useGameState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when used outside GameProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useGameState());
    }).toThrow('useGameState must be used within a GameProvider');

    consoleSpy.mockRestore();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useGameState(), { wrapper });

    expect(result.current.state.mode).toBe('creative');
    expect(result.current.state.isPaused).toBe(true);
    expect(result.current.state.shapes).toEqual([]);
    expect(result.current.state.balls).toEqual([]);
    expect(result.current.state.currentTool).toBe('select');
  });

  describe('togglePause', () => {
    it('should toggle pause state', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      expect(result.current.state.isPaused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.state.isPaused).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.state.isPaused).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should change theme', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.state.theme).toBe('dark');

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.state.theme).toBe('light');
    });
  });

  describe('setTool', () => {
    it('should change current tool', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.setTool('shortLine');
      });

      expect(result.current.state.currentTool).toBe('shortLine');

      act(() => {
        result.current.setTool('delete');
      });

      expect(result.current.state.currentTool).toBe('delete');
    });

    it('should clear selected shape when changing tool', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      // Add a shape and select it
      act(() => {
        result.current.addShape('shortLine');
      });

      const shapeId = result.current.state.shapes[0].id;

      act(() => {
        result.current.selectShape(shapeId);
      });

      expect(result.current.state.selectedShapeId).toBe(shapeId);

      act(() => {
        result.current.setTool('delete');
      });

      expect(result.current.state.selectedShapeId).toBeNull();
    });
  });

  describe('addShape', () => {
    it('should add a shape to state', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addShape('shortLine');
      });

      expect(result.current.state.shapes).toHaveLength(1);
      expect(result.current.state.shapes[0].type).toBe('shortLine');
      expect(result.current.state.shapes[0].x).toBe(800); // Center of canvas
      expect(result.current.state.shapes[0].y).toBe(450);
    });

    it('should increment shapes placed statistic', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      expect(result.current.state.sessionStats.shapesPlaced).toBe(0);

      act(() => {
        result.current.addShape('shortLine');
      });

      expect(result.current.state.sessionStats.shapesPlaced).toBe(1);
    });

    it('should return the created shape', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      let shape: any;
      act(() => {
        shape = result.current.addShape('largeSquare');
      });

      expect(shape).toBeDefined();
      expect(shape.type).toBe('largeSquare');
      expect(shape.id).toBeDefined();
    });
  });

  describe('updateShape', () => {
    it('should update shape properties', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addShape('shortLine');
      });

      const shapeId = result.current.state.shapes[0].id;

      act(() => {
        result.current.updateShape(shapeId, { x: 500, y: 300, rotation: 0.5 });
      });

      expect(result.current.state.shapes[0].x).toBe(500);
      expect(result.current.state.shapes[0].y).toBe(300);
      expect(result.current.state.shapes[0].rotation).toBe(0.5);
    });
  });

  describe('deleteShape', () => {
    it('should remove shape from state', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addShape('shortLine');
        result.current.addShape('largeSquare');
      });

      expect(result.current.state.shapes).toHaveLength(2);

      const shapeId = result.current.state.shapes[0].id;

      act(() => {
        result.current.deleteShape(shapeId);
      });

      expect(result.current.state.shapes).toHaveLength(1);
      expect(result.current.state.shapes[0].type).toBe('largeSquare');
    });

    it('should clear selection if deleted shape was selected', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addShape('shortLine');
      });

      const shapeId = result.current.state.shapes[0].id;

      act(() => {
        result.current.selectShape(shapeId);
      });

      expect(result.current.state.selectedShapeId).toBe(shapeId);

      act(() => {
        result.current.deleteShape(shapeId);
      });

      expect(result.current.state.selectedShapeId).toBeNull();
    });
  });

  describe('ball management', () => {
    it('should add and remove balls', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addBall({ id: 'ball-1', matterBodyId: 1, color: '#FF0000' });
      });

      expect(result.current.state.balls).toHaveLength(1);

      act(() => {
        result.current.removeBall('ball-1');
      });

      expect(result.current.state.balls).toHaveLength(0);
    });

    it('should clear all balls', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addBall({ id: 'ball-1', matterBodyId: 1, color: '#FF0000' });
        result.current.addBall({ id: 'ball-2', matterBodyId: 2, color: '#00FF00' });
        result.current.addBall({ id: 'ball-3', matterBodyId: 3, color: '#0000FF' });
      });

      expect(result.current.state.balls).toHaveLength(3);

      act(() => {
        result.current.clearBalls();
      });

      expect(result.current.state.balls).toHaveLength(0);
    });
  });

  describe('statistics', () => {
    it('should track balls dropped', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      expect(result.current.state.sessionStats.ballsDropped).toBe(0);

      act(() => {
        result.current.incrementBallsDropped();
        result.current.incrementBallsDropped();
      });

      expect(result.current.state.sessionStats.ballsDropped).toBe(2);
    });
  });

  describe('resetSession', () => {
    it('should clear shapes, balls, and session stats', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.addShape('shortLine');
        result.current.addBall({ id: 'ball-1', matterBodyId: 1, color: '#FF0000' });
        result.current.incrementBallsDropped();
      });

      expect(result.current.state.shapes).toHaveLength(1);
      expect(result.current.state.balls).toHaveLength(1);
      expect(result.current.state.sessionStats.ballsDropped).toBe(1);

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.state.shapes).toHaveLength(0);
      expect(result.current.state.balls).toHaveLength(0);
      expect(result.current.state.sessionStats.ballsDropped).toBe(0);
      expect(result.current.state.sessionStats.shapesPlaced).toBe(0);
    });
  });

  describe('settings', () => {
    it('should show and hide settings', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      expect(result.current.state.showSettings).toBe(false);

      act(() => {
        result.current.showSettings(true);
      });

      expect(result.current.state.showSettings).toBe(true);

      act(() => {
        result.current.showSettings(false);
      });

      expect(result.current.state.showSettings).toBe(false);
    });

    it('should update spawn rate', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.setSpawnRate(5);
      });

      expect(result.current.state.spawnRate).toBe(5);
    });
  });

  describe('completeOnboarding', () => {
    it('should set player data and hide onboarding', () => {
      const { result } = renderHook(() => useGameState(), { wrapper });

      act(() => {
        result.current.completeOnboarding('TestPlayer', 'creative', 'dark');
      });

      expect(result.current.state.player.name).toBe('TestPlayer');
      expect(result.current.state.mode).toBe('creative');
      expect(result.current.state.theme).toBe('dark');
      expect(result.current.state.showOnboarding).toBe(false);
    });
  });
});
