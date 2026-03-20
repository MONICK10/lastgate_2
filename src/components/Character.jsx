import { useEffect, useState, useCallback } from "react";
import "./Character.css";
import { checkCollisions } from "../lib/collisionDetection";

const SPRITE_CONFIG = {
  idle: {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 1,
    frameDuration: 100,
  },
  walk: {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    frameDuration: 100,
  },
};

export default function Character() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState("down"); // down, up, left, right
  const [isMoving, setIsMoving] = useState(false);
  const [spriteFlipped, setSpriteFlipped] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationState, setAnimationState] = useState("idle"); // idle or walk
  const [keysPressed, setKeysPressed] = useState({});

  const SPEED = 5;
  const CHAR_WIDTH = 64;
  const CHAR_HEIGHT = 64;

  // Screen boundaries
  const MAX_X = window.innerWidth - CHAR_WIDTH;
  const MAX_Y = window.innerHeight - CHAR_HEIGHT;

  // Handle key down
  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      e.preventDefault();
      setKeysPressed((prev) => ({ ...prev, [key]: true }));
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    setKeysPressed((prev) => ({ ...prev, [key]: false }));
  }, []);

  // Update animation frame
  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0);
      setAnimationState("idle");
      return;
    }

    setAnimationState("walk");
    const config = SPRITE_CONFIG.walk;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % config.frameCount);
    }, config.frameDuration);

    return () => clearInterval(interval);
  }, [isMoving]);

  // Main movement loop
  useEffect(() => {
    const movementLoop = setInterval(() => {
      setPosition((prevPos) => {
        let newX = prevPos.x;
        let newY = prevPos.y;
        let moved = false;
        let newDirection = direction;

        const { arrowup, arrowdown, arrowleft, arrowright, w, a, s, d } = keysPressed;

        // Horizontal movement (left/right)
        if (arrowleft || a) {
          newX -= SPEED;
          newDirection = "left";
          setSpriteFlipped(true);
          moved = true;
        } else if (arrowright || d) {
          newX += SPEED;
          newDirection = "right";
          setSpriteFlipped(false);
          moved = true;
        }

        // Vertical movement (up/down)
        if (arrowup || w) {
          newY -= SPEED;
          newDirection = "up";
          moved = true;
        } else if (arrowdown || s) {
          newY += SPEED;
          newDirection = "down";
          moved = true;
        }

        // Apply boundary restrictions
        newX = Math.max(0, Math.min(newX, MAX_X));
        newY = Math.max(0, Math.min(newY, MAX_Y));

        // Check collisions with buildings
        const charBounds = {
          x: newX + 16, // Add padding for collision box
          y: newY + 32, // Account for character height
          width: CHAR_WIDTH - 32,
          height: CHAR_HEIGHT - 32,
        };

        if (checkCollisions(charBounds)) {
          // Collision detected, revert to previous position
          setIsMoving(false);
          return prevPos;
        }

        setDirection(newDirection);
        setIsMoving(moved);

        return {
          x: newX,
          y: newY,
        };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(movementLoop);
  }, [keysPressed, direction, MAX_X, MAX_Y]);

  // Add/remove event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const spriteConfig = SPRITE_CONFIG[animationState];

  return (
    <div
      className={`character ${spriteFlipped ? "flipped" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Placeholder sprite - replace with actual sprite sheet */}
      <div
        className="sprite"
        style={{
          backgroundPosition: `-${currentFrame * spriteConfig.frameWidth}px 0`,
          width: `${spriteConfig.frameWidth}px`,
          height: `${spriteConfig.frameHeight}px`,
          // When you have sprite sheets, use:
          // backgroundImage: `url('/assets/sprites/${animationState}.png')`
          backgroundColor: "rgba(255, 200, 200, 0.5)", // Placeholder
          border: "2px solid rgba(100, 100, 100, 0.5)",
          borderRadius: "4px",
        }}
      />
    </div>
  );
}
