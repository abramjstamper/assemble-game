import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { usePhysics } from '../../hooks/usePhysics';
import { useUndo } from '../../hooks/useUndo';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_DIAMETER,
  LINE_THICKNESS,
  ENDPOINT_DOT_DIAMETER,
} from '../../constants/dimensions';
import { getShapeColor } from '../../constants/colors';
import { getTheme } from '../../themes';
import { SHAPE_CONFIGS, type Shape, type ShapeType } from '../../types/shapes';
import type { Ball } from '../../types/game';
import './GameCanvas.css';

interface DragState {
  shapeId: string;
  offsetX: number;
  offsetY: number;
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const {
    state,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    addBall,
    removeBall,
    clearBalls,
    incrementBallsDropped,
    setTool,
    dispatch,
  } = useGameState();

  const { pushState, undo: undoAction, redo: redoAction } = useUndo();

  // Track ball colors
  const ballColorsRef = useRef<Map<string, string>>(new Map());

  // Shape to Matter.js body ID mapping
  const shapeBodyMapRef = useRef<Map<string, number>>(new Map());

  const handleBallCreated = useCallback((ball: Ball) => {
    ballColorsRef.current.set(ball.id, ball.color);
    addBall(ball);
  }, [addBall]);

  const handleBallRemoved = useCallback((id: string) => {
    ballColorsRef.current.delete(id);
    removeBall(id);
  }, [removeBall]);

  const {
    addShapeToWorld,
    removeShapeFromWorld,
    updateShapeInWorld,
    getBallPositions,
    clearAllBalls,
    clearAllShapes,
  } = usePhysics({
    isPaused: state.isPaused,
    spawnRate: state.spawnRate,
    theme: state.theme,
    mode: state.mode,
    onBallDropped: incrementBallsDropped,
    onBallCreated: handleBallCreated,
    onBallRemoved: handleBallRemoved,
  });

  // Expose undo/redo functions for toolbar
  useEffect(() => {
    window.__gameUndo = () => {
      const shapes = undoAction();
      if (shapes) {
        // Remove all current shapes from physics world
        shapeBodyMapRef.current.forEach((bodyId) => {
          removeShapeFromWorld(bodyId);
        });
        shapeBodyMapRef.current.clear();

        // Add restored shapes to physics world
        shapes.forEach((shape) => {
          const body = addShapeToWorld(shape);
          shapeBodyMapRef.current.set(shape.id, body.id);
        });

        dispatch({ type: 'SET_SHAPES', payload: shapes });
      }
    };

    window.__gameRedo = () => {
      const shapes = redoAction();
      if (shapes) {
        // Remove all current shapes from physics world
        shapeBodyMapRef.current.forEach((bodyId) => {
          removeShapeFromWorld(bodyId);
        });
        shapeBodyMapRef.current.clear();

        // Add restored shapes to physics world
        shapes.forEach((shape) => {
          const body = addShapeToWorld(shape);
          shapeBodyMapRef.current.set(shape.id, body.id);
        });

        dispatch({ type: 'SET_SHAPES', payload: shapes });
      }
    };

    window.__gameClearBalls = () => {
      clearAllBalls();
      clearBalls();
    };

    window.__gameLoadState = (saveData: { shapes?: Shape[]; spawnRate?: number; mode?: string }) => {
      // Clear all balls from physics world
      clearAllBalls();
      clearBalls();

      // Clear all shapes from physics world
      shapeBodyMapRef.current.forEach((bodyId) => {
        removeShapeFromWorld(bodyId);
      });
      shapeBodyMapRef.current.clear();

      // Add restored shapes to physics world
      const shapes = saveData.shapes || [];
      shapes.forEach((shape) => {
        const body = addShapeToWorld(shape);
        shapeBodyMapRef.current.set(shape.id, body.id);
      });

      dispatch({ type: 'SET_SHAPES', payload: shapes });

      // Restore spawn rate if provided
      if (saveData.spawnRate !== undefined) {
        dispatch({ type: 'SET_SPAWN_RATE', payload: saveData.spawnRate });
      }
    };

    window.__gameReset = () => {
      // Clear all shapes from physics world
      clearAllShapes();
      shapeBodyMapRef.current.clear();
      // Clear all balls from physics world
      clearAllBalls();
    };

    return () => {
      delete window.__gameUndo;
      delete window.__gameRedo;
      delete window.__gameClearBalls;
      delete window.__gameReset;
      delete window.__gameLoadState;
    };
  }, [undoAction, redoAction, dispatch, removeShapeFromWorld, addShapeToWorld, clearAllBalls, clearAllShapes, clearBalls]);

  const theme = getTheme(state.theme);

  // Get shape dimensions in pixels
  const getShapeDimensions = (type: ShapeType) => {
    const config = SHAPE_CONFIGS[type];
    const width = CANVAS_WIDTH * config.width;
    const height = config.isLine ? LINE_THICKNESS : CANVAS_WIDTH * config.height;
    return { width, height, isLine: config.isLine };
  };

  // Check if point is inside shape (accounting for rotation)
  const isPointInShape = (x: number, y: number, shape: Shape): boolean => {
    const { width, height } = getShapeDimensions(shape.type);

    // Transform point to shape's local coordinate system
    const cos = Math.cos(-shape.rotation);
    const sin = Math.sin(-shape.rotation);
    const dx = x - shape.x;
    const dy = y - shape.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
  };

  // Find shape at point
  const findShapeAtPoint = (x: number, y: number): Shape | null => {
    // Check from top to bottom (last added is on top)
    for (let i = state.shapes.length - 1; i >= 0; i--) {
      if (isPointInShape(x, y, state.shapes[i])) {
        return state.shapes[i];
      }
    }
    return null;
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we're placing a new shape
    if (state.currentTool !== 'select' && state.currentTool !== 'delete') {
      // Save current state for undo
      pushState(state.shapes);

      const newShape = addShape(state.currentTool as ShapeType);
      const body = addShapeToWorld({ ...newShape, x, y });
      shapeBodyMapRef.current.set(newShape.id, body.id);
      updateShape(newShape.id, { x, y, matterBodyId: body.id });

      setDragState({
        shapeId: newShape.id,
        offsetX: 0,
        offsetY: 0,
      });
      selectShape(newShape.id);
      setTool('select');
      return;
    }

    // Check if clicking on a shape
    const shape = findShapeAtPoint(x, y);

    if (shape) {
      if (state.currentTool === 'delete') {
        // Save current state for undo
        pushState(state.shapes);

        const bodyId = shapeBodyMapRef.current.get(shape.id);
        if (bodyId) {
          removeShapeFromWorld(bodyId);
          shapeBodyMapRef.current.delete(shape.id);
        }
        deleteShape(shape.id);
        return;
      }

      // Start dragging
      setDragState({
        shapeId: shape.id,
        offsetX: x - shape.x,
        offsetY: y - shape.y,
      });
      selectShape(shape.id);
    } else {
      selectShape(null);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragState.offsetX;
    const y = e.clientY - rect.top - dragState.offsetY;

    // Clamp to canvas bounds
    const shape = state.shapes.find(s => s.id === dragState.shapeId);
    if (!shape) return;

    const { width, height } = getShapeDimensions(shape.type);
    const clampedX = Math.max(width / 2, Math.min(CANVAS_WIDTH - width / 2, x));
    const clampedY = Math.max(height / 2, Math.min(CANVAS_HEIGHT - height / 2, y));

    updateShape(dragState.shapeId, { x: clampedX, y: clampedY });

    const bodyId = shapeBodyMapRef.current.get(dragState.shapeId);
    if (bodyId) {
      updateShapeInWorld(bodyId, clampedX, clampedY, shape.rotation);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (dragState) {
      // Save state after drag for undo
      pushState(state.shapes);
    }
    setDragState(null);
  };

  // Handle wheel for rotation
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!state.selectedShapeId) return;
    e.preventDefault();

    const shape = state.shapes.find(s => s.id === state.selectedShapeId);
    if (!shape) return;

    // Save state before rotation
    if (!dragState) {
      pushState(state.shapes);
    }

    const rotationSpeed = 0.05;
    const newRotation = shape.rotation + (e.deltaY > 0 ? rotationSpeed : -rotationSpeed);

    updateShape(shape.id, { rotation: newRotation });

    const bodyId = shapeBodyMapRef.current.get(shape.id);
    if (bodyId) {
      updateShapeInWorld(bodyId, shape.x, shape.y, newRotation);
    }
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = theme.canvasBackground;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw shapes
      state.shapes.forEach((shape) => {
        const { width, height, isLine } = getShapeDimensions(shape.type);
        const color = getShapeColor(shape.type, state.theme);

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);

        // Shadow/glow
        if (state.theme === 'dark') {
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowColor = theme.shapes.shadowColor;
          ctx.shadowBlur = theme.shapes.shadowBlur;
          ctx.shadowOffsetX = theme.shapes.shadowOffsetX;
          ctx.shadowOffsetY = theme.shapes.shadowOffsetY;
        }

        // Main shape
        ctx.fillStyle = color;
        ctx.fillRect(-width / 2, -height / 2, width, height);

        // Reset shadow for outline
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Outline (light/dark edges for 3D effect)
        ctx.strokeStyle = theme.shapes.outlineLight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width / 2, height / 2);
        ctx.lineTo(-width / 2, -height / 2);
        ctx.lineTo(width / 2, -height / 2);
        ctx.stroke();

        ctx.strokeStyle = theme.shapes.outlineDark;
        ctx.beginPath();
        ctx.moveTo(width / 2, -height / 2);
        ctx.lineTo(width / 2, height / 2);
        ctx.lineTo(-width / 2, height / 2);
        ctx.stroke();

        // Draw endpoint dots for lines
        if (isLine) {
          ctx.fillStyle = color;
          ctx.globalAlpha = theme.shapes.endpointDotOpacity;

          // Left dot
          ctx.beginPath();
          ctx.arc(-width / 2, 0, ENDPOINT_DOT_DIAMETER / 2, 0, Math.PI * 2);
          ctx.fill();

          // Right dot
          ctx.beginPath();
          ctx.arc(width / 2, 0, ENDPOINT_DOT_DIAMETER / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 1;
        }

        // Selection indicator
        if (state.selectedShapeId === shape.id) {
          ctx.strokeStyle = state.theme === 'dark' ? '#FFFFFF' : '#000000';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
          ctx.setLineDash([]);
        }

        ctx.restore();
      });

      // Draw balls
      const ballPositions = getBallPositions();
      state.balls.forEach((ball) => {
        const pos = ballPositions.get(ball.matterBodyId);
        if (!pos) return;

        const color = ballColorsRef.current.get(ball.id) || ball.color;

        ctx.save();

        // Glow effect in dark mode
        if (state.theme === 'dark') {
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowColor = theme.balls.shadowColor;
          ctx.shadowBlur = theme.balls.shadowBlur;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BALL_DIAMETER / 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        const gradient = ctx.createRadialGradient(
          pos.x - BALL_DIAMETER / 4,
          pos.y - BALL_DIAMETER / 4,
          0,
          pos.x,
          pos.y,
          BALL_DIAMETER / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BALL_DIAMETER / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.shapes, state.balls, state.selectedShapeId, state.theme, theme, getBallPositions]);

  // Update cursor based on tool
  const getCursor = () => {
    if (dragState) return 'grabbing';
    if (state.currentTool === 'delete') return 'crosshair';
    if (state.currentTool !== 'select') return 'copy';
    return 'default';
  };

  return (
    <div ref={containerRef} className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: getCursor() }}
      />
      {state.isPaused && (
        <div className="pause-overlay">
          <span>PAUSED</span>
        </div>
      )}
    </div>
  );
}
