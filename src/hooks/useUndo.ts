import { useCallback, useRef } from 'react';
import type { Shape } from '../types/shapes';

interface UndoState {
  shapes: Shape[];
}

interface UseUndoReturn {
  pushState: (shapes: Shape[]) => void;
  undo: () => Shape[] | null;
  redo: () => Shape[] | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY = 50;

export function useUndo(): UseUndoReturn {
  const historyRef = useRef<UndoState[]>([]);
  const currentIndexRef = useRef<number>(-1);

  const pushState = useCallback((shapes: Shape[]) => {
    const newState: UndoState = { shapes: JSON.parse(JSON.stringify(shapes)) };

    // Remove any future states if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }

    // Add new state
    historyRef.current.push(newState);
    currentIndexRef.current++;

    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
      currentIndexRef.current--;
    }
  }, []);

  const undo = useCallback((): Shape[] | null => {
    if (currentIndexRef.current <= 0) return null;

    currentIndexRef.current--;
    const state = historyRef.current[currentIndexRef.current];
    return state ? JSON.parse(JSON.stringify(state.shapes)) : null;
  }, []);

  const redo = useCallback((): Shape[] | null => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return null;

    currentIndexRef.current++;
    const state = historyRef.current[currentIndexRef.current];
    return state ? JSON.parse(JSON.stringify(state.shapes)) : null;
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
    clear,
  };
}
