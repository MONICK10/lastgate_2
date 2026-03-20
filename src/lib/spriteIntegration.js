/**
 * SPRITE SHEET INTEGRATION GUIDE
 *
 * This file shows how to connect your sprite sheet assets
 * to the Character component animation system.
 */

// STEP 1: Prepare your sprite sheets
// You'll need these files in /public/assets/sprites/:
// - idle.png (1 frame, 64x64px minimum)
// - walk.png (4 frames horizontally, 256x64px minimum)
//
// Frame layout example for walk.png:
// [Frame0][Frame1][Frame2][Frame3]
// Each frame should be 64x64 pixels

// STEP 2: Update SPRITE_CONFIG in Character.jsx
// The config already supports multiple animation states:

const SPRITE_CONFIG_EXAMPLE = {
  idle: {
    frameWidth: 64,      // Width of each frame
    frameHeight: 64,     // Height of each frame
    frameCount: 1,       // Number of frames in spritesheet
    frameDuration: 100,  // Milliseconds per frame
  },
  walk: {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,       // 4 frames of animation
    frameDuration: 100,
  },
  // Optional: Add more animations later
  run: {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    frameDuration: 50,   // Faster animation
  },
  interact: {
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 3,
    frameDuration: 150,
  },
};

// STEP 3: Update Character.jsx sprite rendering section
// Replace this placeholder code in Character.jsx:

/*
      <div
        className="sprite"
        style={{
          backgroundPosition: `-${currentFrame * spriteConfig.frameWidth}px 0`,
          width: `${spriteConfig.frameWidth}px`,
          height: `${spriteConfig.frameHeight}px`,
          backgroundColor: "rgba(255, 200, 200, 0.5)", // REMOVE THIS
          border: "2px solid rgba(100, 100, 100, 0.5)", // REMOVE THIS
        }}
      />
*/

// WITH THIS:

const SPRITE_EXAMPLE = `
      <div
        className="sprite"
        style={{
          backgroundImage: \`url('/assets/sprites/\${animationState}.png')\`,
          backgroundPosition: \`-\${currentFrame * spriteConfig.frameWidth}px 0\`,
          backgroundSize: \`\${spriteConfig.frameCount * spriteConfig.frameWidth}px \${spriteConfig.frameHeight}px\`,
          backgroundRepeat: 'no-repeat',
          width: \`\${spriteConfig.frameWidth}px\`,
          height: \`\${spriteConfig.frameHeight}px\`,
        }}
      />
`;

// STEP 4: Sprite sheet format checklist
// □ Horizontal spritesheet (all frames in one row)
// □ Each frame is 64x64 pixels (adjust SPRITE_CONFIG if different)
// □ No gaps between frames
// □ Transparent background (PNG format)
// □ File names match state names (idle.png, walk.png, etc.)
// □ Stored in /public/assets/sprites/

// STEP 5: Testing
// 1. Place sprite files in /public/assets/sprites/
// 2. Update SPRITE_CONFIG frameCount to match your sheets
// 3. Replace the placeholder div with sprite code from STEP 3
// 4. Test movement with arrow keys on /mission/map
// 5. Character should animate smoothly when moving
// 6. Character should flip when moving left/right

// STEP 6: Animation timings
// Adjust frameDuration for different feel:
// 50ms   = Very fast, snappy animation
// 100ms  = Standard walking speed
// 150ms  = Slow, heavy movement
// 200ms+ = Very slow animation

// STEP 7: Common sprite sheet tools
// - Aseprite (paid, highly recommended)
// - Piskel (free, browser-based)
// - LibreSprite (free, open-source)
// - GrafX2 (free, pixel art)

export const spriteGuide = {
  expectedStructure: "/public/assets/sprites/walk.png",
  pixelSize: 64,
  characterStates: ["idle", "walk", "run", "interact"],
  currentlySupported: ["idle", "walk"],
};
