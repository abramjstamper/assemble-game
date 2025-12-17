import { useEffect, useRef, useCallback, useState } from 'react';
import Matter from 'matter-js';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_DIAMETER,
  SPAWN_X,
  SPAWN_Y,
  BOUNCE_COEFFICIENT,
  LINE_THICKNESS,
} from '../constants/dimensions';
import { getRandomBallColor } from '../constants/colors';
import { SHAPE_CONFIGS, type Shape } from '../types/shapes';
import type { Ball, Theme, GameMode } from '../types/game';
import { MAX_BALLS } from '../types/game';

interface UsePhysicsOptions {
  isPaused: boolean;
  spawnRate: number;
  theme: Theme;
  mode: GameMode;
  onBallDropped: () => void;
  onBallCreated: (ball: Ball) => void;
  onBallRemoved: (id: string) => void;
}

interface UsePhysicsReturn {
  engineRef: React.RefObject<Matter.Engine | null>;
  addShapeToWorld: (shape: Shape) => Matter.Body;
  removeShapeFromWorld: (matterBodyId: number) => void;
  updateShapeInWorld: (matterBodyId: number, x: number, y: number, rotation: number) => void;
  getBallPositions: () => Map<number, { x: number; y: number }>;
  getShapePositions: () => Map<number, { x: number; y: number; angle: number }>;
  clearAllBalls: () => void;
  clearAllShapes: () => void;
  ballCount: number;
}

export function usePhysics(options: UsePhysicsOptions): UsePhysicsReturn {
  const { isPaused, spawnRate, theme, mode, onBallDropped, onBallCreated, onBallRemoved } = options;

  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const ballBodiesRef = useRef<Map<number, { id: string; body: Matter.Body }>>(new Map());
  const shapeBodiesRef = useRef<Map<number, Matter.Body>>(new Map());
  const spawnTimerRef = useRef<number | null>(null);
  const [ballCount, setBallCount] = useState(0);

  // Initialize engine
  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
      positionIterations: 10,  // Default is 6, increase for better collision with thin bodies
      velocityIterations: 8,   // Default is 4, helps prevent tunneling
    });

    engineRef.current = engine;

    // Create walls
    const wallOptions = {
      isStatic: true,
      restitution: BOUNCE_COEFFICIENT,
      friction: 0,
      label: 'wall',
    };

    const wallThickness = 50;

    // Top wall
    const topWall = Matter.Bodies.rectangle(
      CANVAS_WIDTH / 2,
      -wallThickness / 2,
      CANVAS_WIDTH,
      wallThickness,
      { ...wallOptions, label: 'wall-top' }
    );

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2,
      CANVAS_HEIGHT / 2,
      wallThickness,
      CANVAS_HEIGHT,
      { ...wallOptions, label: 'wall-left' }
    );

    // Right wall
    const rightWall = Matter.Bodies.rectangle(
      CANVAS_WIDTH + wallThickness / 2,
      CANVAS_HEIGHT / 2,
      wallThickness,
      CANVAS_HEIGHT,
      { ...wallOptions, label: 'wall-right' }
    );

    // Bottom wall (only in challenge mode)
    const bottomWall = Matter.Bodies.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT + wallThickness / 2,
      CANVAS_WIDTH,
      wallThickness,
      { ...wallOptions, label: 'wall-bottom', isSensor: mode === 'creative' }
    );

    Matter.Composite.add(engine.world, [topWall, leftWall, rightWall, bottomWall]);

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Handle collisions for ball removal
    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check if ball hit bottom sensor (creative mode)
        if (mode === 'creative') {
          let ball: Matter.Body | null = null;
          if (bodyA.label === 'wall-bottom' && bodyB.label === 'ball') {
            ball = bodyB;
          } else if (bodyB.label === 'wall-bottom' && bodyA.label === 'ball') {
            ball = bodyA;
          }

          if (ball) {
            const ballData = ballBodiesRef.current.get(ball.id);
            if (ballData) {
              Matter.Composite.remove(engine.world, ball);
              ballBodiesRef.current.delete(ball.id);
              setBallCount(ballBodiesRef.current.size);
              onBallRemoved(ballData.id);
              onBallDropped();
            }
          }
        }
      }
    });

    return () => {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Handle pause/resume
  useEffect(() => {
    if (!runnerRef.current || !engineRef.current) return;

    if (isPaused) {
      Matter.Runner.stop(runnerRef.current);
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }
    } else {
      Matter.Runner.run(runnerRef.current, engineRef.current);
    }
  }, [isPaused]);

  // Spawn balls
  const spawnBall = useCallback(() => {
    if (!engineRef.current || isPaused || ballBodiesRef.current.size >= MAX_BALLS) return;

    const id = `ball-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const color = getRandomBallColor(theme);

    const ball = Matter.Bodies.circle(SPAWN_X, SPAWN_Y + BALL_DIAMETER / 2, BALL_DIAMETER / 2, {
      restitution: BOUNCE_COEFFICIENT,
      friction: 0,
      frictionAir: 0,
      label: 'ball',
    });

    Matter.Composite.add(engineRef.current.world, ball);
    ballBodiesRef.current.set(ball.id, { id, body: ball });
    setBallCount(ballBodiesRef.current.size);

    onBallCreated({ id, matterBodyId: ball.id, color });
  }, [isPaused, theme, onBallCreated]);

  // Handle spawn rate changes
  useEffect(() => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }

    if (!isPaused) {
      spawnTimerRef.current = window.setInterval(spawnBall, spawnRate * 1000);
    }

    return () => {
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [spawnRate, isPaused, spawnBall]);

  // Add shape to world
  const addShapeToWorld = useCallback((shape: Shape): Matter.Body => {
    if (!engineRef.current) throw new Error('Engine not initialized');

    const config = SHAPE_CONFIGS[shape.type];
    const width = CANVAS_WIDTH * config.width;
    const height = config.isLine ? LINE_THICKNESS : CANVAS_WIDTH * config.height;

    const body = Matter.Bodies.rectangle(shape.x, shape.y, width, height, {
      isStatic: true,
      restitution: BOUNCE_COEFFICIENT,
      friction: 0,
      angle: shape.rotation,
      label: 'shape',
    });

    Matter.Composite.add(engineRef.current.world, body);
    shapeBodiesRef.current.set(body.id, body);

    return body;
  }, []);

  // Remove shape from world
  const removeShapeFromWorld = useCallback((matterBodyId: number) => {
    if (!engineRef.current) return;

    const body = shapeBodiesRef.current.get(matterBodyId);
    if (body) {
      Matter.Composite.remove(engineRef.current.world, body);
      shapeBodiesRef.current.delete(matterBodyId);
    }
  }, []);

  // Update shape position/rotation
  const updateShapeInWorld = useCallback((matterBodyId: number, x: number, y: number, rotation: number) => {
    const body = shapeBodiesRef.current.get(matterBodyId);
    if (body) {
      // Temporarily make non-static to properly update collision bounds
      Matter.Body.setStatic(body, false);
      Matter.Body.setPosition(body, { x, y });
      Matter.Body.setAngle(body, rotation);
      Matter.Body.setStatic(body, true);
      // Ensure body is awake for collision detection
      Matter.Sleeping.set(body, false);

      // Check for ball collisions and remove any balls under the shape
      if (engineRef.current) {
        const ballsToRemove: number[] = [];
        ballBodiesRef.current.forEach((ballData, ballId) => {
          const collision = Matter.SAT.collides(body, ballData.body);
          if (collision && collision.collided) {
            ballsToRemove.push(ballId);
          }
        });

        ballsToRemove.forEach((ballId) => {
          const ballData = ballBodiesRef.current.get(ballId);
          if (ballData && engineRef.current) {
            Matter.Composite.remove(engineRef.current.world, ballData.body);
            ballBodiesRef.current.delete(ballId);
            onBallRemoved(ballData.id);
          }
        });

        if (ballsToRemove.length > 0) {
          setBallCount(ballBodiesRef.current.size);
        }
      }
    }
  }, [onBallRemoved]);

  // Get current ball positions
  const getBallPositions = useCallback((): Map<number, { x: number; y: number }> => {
    const positions = new Map<number, { x: number; y: number }>();
    ballBodiesRef.current.forEach((ballData, id) => {
      positions.set(id, { x: ballData.body.position.x, y: ballData.body.position.y });
    });
    return positions;
  }, []);

  // Get current shape positions
  const getShapePositions = useCallback((): Map<number, { x: number; y: number; angle: number }> => {
    const positions = new Map<number, { x: number; y: number; angle: number }>();
    shapeBodiesRef.current.forEach((body, id) => {
      positions.set(id, { x: body.position.x, y: body.position.y, angle: body.angle });
    });
    return positions;
  }, []);

  // Clear all balls
  const clearAllBalls = useCallback(() => {
    if (!engineRef.current) return;

    ballBodiesRef.current.forEach((ballData) => {
      if (engineRef.current) {
        Matter.Composite.remove(engineRef.current.world, ballData.body);
      }
    });
    ballBodiesRef.current.clear();
    setBallCount(0);
  }, []);

  // Clear all shapes
  const clearAllShapes = useCallback(() => {
    if (!engineRef.current) return;

    shapeBodiesRef.current.forEach((body) => {
      if (engineRef.current) {
        Matter.Composite.remove(engineRef.current.world, body);
      }
    });
    shapeBodiesRef.current.clear();
  }, []);

  return {
    engineRef,
    addShapeToWorld,
    removeShapeFromWorld,
    updateShapeInWorld,
    getBallPositions,
    getShapePositions,
    clearAllBalls,
    clearAllShapes,
    ballCount,
  };
}
