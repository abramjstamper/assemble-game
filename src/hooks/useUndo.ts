import { useCallback, useRef, useState } from 'react';
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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateCanUndoRedo = useCallback(() => {
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
  }, []);

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

    updateCanUndoRedo();
  }, [updateCanUndoRedo]);

  const undo = useCallback((): Shape[] | null => {
    if (currentIndexRef.current <= 0) return null;

    currentIndexRef.current--;
    const state = historyRef.current[currentIndexRef.current];
    updateCanUndoRedo();
    return state ? JSON.parse(JSON.stringify(state.shapes)) : null;
  }, [updateCanUndoRedo]);

  const redo = useCallback((): Shape[] | null => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return null;

    currentIndexRef.current++;
    const state = historyRef.current[currentIndexRef.current];
    updateCanUndoRedo();
    return state ? JSON.parse(JSON.stringify(state.shapes)) : null;
  }, [updateCanUndoRedo]);

  const clear = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    updateCanUndoRedo();
  }, [updateCanUndoRedo]);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
