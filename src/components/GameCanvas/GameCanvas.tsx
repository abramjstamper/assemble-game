import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { usePhysics } from '../../hooks/usePhysics';
import { useUndo } from '../../hooks/useUndo';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_DIAMETER,
  LINE_THICKNESS,
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

interface PinchState {
  initialAngle: number;
  initialRotation: number;
  shapeId: string;
}

// Calculate angle between two touch points
const getTouchAngle = (touch1: React.Touch, touch2: React.Touch): number => {
  return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
};

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pinchState, setPinchState] = useState<PinchState | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  // Dynamic canvas sizing based on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Calculate size maintaining 16:9 aspect ratio
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      let width = rect.width;
      let height = rect.height;

      if (width / height > aspectRatio) {
        // Container is wider than 16:9, constrain by height
        width = height * aspectRatio;
      } else {
        // Container is taller than 16:9, constrain by width
        height = width / aspectRatio;
      }

      setCanvasSize({
        width: Math.floor(width * dpr),
        height: Math.floor(height * dpr),
      });
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    window.addEventListener('orientationchange', updateCanvasSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, []);

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
    togglePause,
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

  // Convert client coordinates to game coordinates (accounting for CSS scaling and canvas scaling)
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas) return null;

    // Convert screen position to canvas pixel position
    const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

    // Convert canvas pixels to game coordinates (1600x900 virtual space)
    const x = (canvasX / canvasSize.width) * CANVAS_WIDTH;
    const y = (canvasY / canvasSize.height) * CANVAS_HEIGHT;

    return { x, y };
  };

  // Get coordinates from mouse event
  const getMouseCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    return getCanvasCoordinates(e.clientX, e.clientY);
  };

  // Get coordinates from touch event
  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return null;
    const touch = e.touches[0];
    return getCanvasCoordinates(touch.clientX, touch.clientY);
  };

  // Handle pointer down (shared logic for mouse and touch)
  const handlePointerDown = (x: number, y: number) => {
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

  // Handle pointer move (shared logic for mouse and touch)
  const handlePointerMove = (x: number, y: number) => {
    if (!dragState) return;

    const moveX = x - dragState.offsetX;
    const moveY = y - dragState.offsetY;

    // Clamp to canvas bounds
    const shape = state.shapes.find(s => s.id === dragState.shapeId);
    if (!shape) return;

    const { width, height } = getShapeDimensions(shape.type);
    const clampedX = Math.max(width / 2, Math.min(CANVAS_WIDTH - width / 2, moveX));
    const clampedY = Math.max(height / 2, Math.min(CANVAS_HEIGHT - height / 2, moveY));

    updateShape(dragState.shapeId, { x: clampedX, y: clampedY });

    const bodyId = shapeBodyMapRef.current.get(dragState.shapeId);
    if (bodyId) {
      updateShapeInWorld(bodyId, clampedX, clampedY, shape.rotation);
    }
  };

  // Handle pointer up (shared logic for mouse and touch)
  const handlePointerUp = () => {
    if (dragState) {
      // Save state after drag for undo
      pushState(state.shapes);
    }
    setDragState(null);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (coords) handlePointerDown(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (coords) handlePointerMove(coords.x, coords.y);
  };

  const handleMouseUp = () => handlePointerUp();

  // Get midpoint of two touches in canvas coordinates
  const getTwoTouchMidpoint = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2) return null;
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    return getCanvasCoordinates(midX, midY);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling

    // Two-finger touch for rotation
    if (e.touches.length === 2) {
      // Find shape under the midpoint of the two fingers
      const midpoint = getTwoTouchMidpoint(e);
      let shapeToRotate = state.selectedShapeId
        ? state.shapes.find(s => s.id === state.selectedShapeId)
        : null;

      // If no shape selected, try to find one under the touch midpoint
      if (!shapeToRotate && midpoint) {
        shapeToRotate = findShapeAtPoint(midpoint.x, midpoint.y);
        if (shapeToRotate) {
          selectShape(shapeToRotate.id);
        }
      }

      if (shapeToRotate) {
        const angle = getTouchAngle(e.touches[0], e.touches[1]);
        setPinchState({
          initialAngle: angle,
          initialRotation: shapeToRotate.rotation,
          shapeId: shapeToRotate.id,
        });
        // Save state for undo when starting rotation
        pushState(state.shapes);
      }
      return;
    }

    // Single finger touch
    const coords = getTouchCoords(e);
    if (coords) handlePointerDown(coords.x, coords.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling

    // Two-finger rotation
    if (e.touches.length === 2 && pinchState) {
      const shape = state.shapes.find(s => s.id === pinchState.shapeId);
      if (shape) {
        const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
        const angleDelta = currentAngle - pinchState.initialAngle;
        // Apply rotation multiplier for more responsive feel
        const rotationMultiplier = 1.5;
        const newRotation = pinchState.initialRotation + (angleDelta * rotationMultiplier);

        updateShape(shape.id, { rotation: newRotation });

        const bodyId = shapeBodyMapRef.current.get(shape.id);
        if (bodyId) {
          updateShapeInWorld(bodyId, shape.x, shape.y, newRotation);
        }
      }
      return;
    }

    // Single finger drag
    const coords = getTouchCoords(e);
    if (coords) handlePointerMove(coords.x, coords.y);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // If we were pinching and now have less than 2 fingers, end pinch
    if (pinchState && e.touches.length < 2) {
      setPinchState(null);
    }

    // If no more touches, end drag
    if (e.touches.length === 0) {
      handlePointerUp();
    }
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

    // Calculate scale factor from game coordinates to canvas pixels
    const scaleX = canvasSize.width / CANVAS_WIDTH;
    const scaleY = canvasSize.height / CANVAS_HEIGHT;

    const render = () => {
      // Reset transform and clear canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = theme.canvasBackground;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Apply scale transform for game coordinate system
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

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

        // Draw endpoint circles for lines (flush with line, with inset contrasting outline)
        if (isLine) {
          const outlineColor = state.theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)';
          const outlineWidth = 2;
          const radius = height / 2;
          const insetRadius = radius - outlineWidth - 3;
          const yOffset = 0;

          // Left circle - fill then inset outline
          ctx.beginPath();
          ctx.arc(-width / 2, yOffset, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-width / 2, yOffset, insetRadius, 0, Math.PI * 2);
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = outlineWidth;
          ctx.stroke();

          // Right circle - fill then inset outline
          ctx.beginPath();
          ctx.arc(width / 2, yOffset, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(width / 2, yOffset, insetRadius, 0, Math.PI * 2);
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = outlineWidth;
          ctx.stroke();
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
  }, [state.shapes, state.balls, state.selectedShapeId, state.theme, theme, getBallPositions, canvasSize]);

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
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        style={{ cursor: getCursor(), touchAction: 'none' }}
      />
      {state.isPaused && (
        <div className="pause-overlay" onClick={togglePause} onTouchEnd={togglePause}>
          <span>PAUSED</span>
          <span className="pause-hint">Tap to resume</span>
        </div>
      )}
    </div>
  );
}
