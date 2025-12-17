import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndo } from './useUndo';
import type { Shape } from '../types/shapes';

const createShape = (id: string, x: number = 100, y: number = 100): Shape => ({
  id,
  type: 'shortLine',
  x,
  y,
  rotation: 0,
});

describe('useUndo', () => {
  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useUndo());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should push state to history', () => {
    const { result } = renderHook(() => useUndo());
    const shapes = [createShape('1')];

    act(() => {
      result.current.pushState(shapes);
    });

    // After first push, we're at index 0, so canUndo is still false
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should enable undo after multiple pushes', () => {
    const { result } = renderHook(() => useUndo());

    act(() => {
      result.current.pushState([createShape('1')]);
      result.current.pushState([createShape('1'), createShape('2')]);
    });

    // Undo should return a value (proving there's history to undo)
    let undoneState: Shape[] | null = null;
    act(() => {
      undoneState = result.current.undo();
    });
    expect(undoneState).not.toBeNull();
  });

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndo());
    const state1 = [createShape('1')];
    const state2 = [createShape('1'), createShape('2')];

    act(() => {
      result.current.pushState(state1);
      result.current.pushState(state2);
    });

    let undoneState: Shape[] | null = null;
    act(() => {
      undoneState = result.current.undo();
    });

    expect(undoneState).toEqual(state1);

    // Can't undo further (only 1 state left)
    let secondUndo: Shape[] | null = null;
    act(() => {
      secondUndo = result.current.undo();
    });
    expect(secondUndo).toBeNull();

    // Can redo back to state2
    let redoneState: Shape[] | null = null;
    act(() => {
      redoneState = result.current.redo();
    });
    expect(redoneState).toEqual(state2);
  });

  it('should redo to next state', () => {
    const { result } = renderHook(() => useUndo());
    const state1 = [createShape('1')];
    const state2 = [createShape('1'), createShape('2')];

    act(() => {
      result.current.pushState(state1);
      result.current.pushState(state2);
    });

    act(() => {
      result.current.undo();
    });

    let redoneState: Shape[] | null = null;
    act(() => {
      redoneState = result.current.redo();
    });

    expect(redoneState).toEqual(state2);

    // Can't redo further
    let secondRedo: Shape[] | null = null;
    act(() => {
      secondRedo = result.current.redo();
    });
    expect(secondRedo).toBeNull();
  });

  it('should return null when undo is not possible', () => {
    const { result } = renderHook(() => useUndo());

    let undoneState: Shape[] | null = null;
    act(() => {
      undoneState = result.current.undo();
    });

    expect(undoneState).toBeNull();
  });

  it('should return null when redo is not possible', () => {
    const { result } = renderHook(() => useUndo());

    let redoneState: Shape[] | null = null;
    act(() => {
      redoneState = result.current.redo();
    });

    expect(redoneState).toBeNull();
  });

  it('should clear future history when pushing after undo', () => {
    const { result } = renderHook(() => useUndo());
    const state1 = [createShape('1')];
    const state2 = [createShape('1'), createShape('2')];
    const state3 = [createShape('3')];

    act(() => {
      result.current.pushState(state1);
      result.current.pushState(state2);
      result.current.undo();
      result.current.pushState(state3);
    });

    expect(result.current.canRedo).toBe(false);

    let undoneState: Shape[] | null = null;
    act(() => {
      undoneState = result.current.undo();
    });

    expect(undoneState).toEqual(state1);
  });

  it('should clear all history', () => {
    const { result } = renderHook(() => useUndo());

    act(() => {
      result.current.pushState([createShape('1')]);
      result.current.pushState([createShape('2')]);
      result.current.clear();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should deep clone shapes to prevent mutation', () => {
    const { result } = renderHook(() => useUndo());
    const originalShape = createShape('1', 100, 100);
    const shapes = [originalShape];

    act(() => {
      result.current.pushState(shapes);
      result.current.pushState([{ ...originalShape, x: 200 }]);
    });

    // Mutate the original
    originalShape.x = 999;

    let undoneState: Shape[] | null = null;
    act(() => {
      undoneState = result.current.undo();
    });

    // Should have the original x value, not the mutated one
    expect(undoneState![0].x).toBe(100);
  });
});
