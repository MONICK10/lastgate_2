# Character Movement System - Implementation Guide

## Overview
Your 2D character movement system is now fully implemented with all requested features:
- ✅ Smooth arrow key movement (WASD alternative supported)
- ✅ Boundary restriction (character stays within screen)
- ✅ Collision detection with buildings
- ✅ Sprite flipping when moving left/right
- ✅ Animation frame system (idle/walk states)
- ✅ 60 FPS movement loop
- ✅ Sprite sheet ready architecture

## Project Files Created

### Components
- **`src/components/Character.jsx`** - Main character component (174 lines)
  - Movement logic with smooth 60 FPS loop
  - Keyboard input handling (arrows + WASD)
  - Animation state management
  - Collision detection integration

- **`src/components/Character.css`** - Character styling
  - Positioned absolutely on map
  - Sprite flipping with `scaleX(-1)`
  - Pixelated image rendering mode

### Game Systems
- **`src/lib/collisionDetection.js`** - Collision system
  - 5 building bounding boxes (Lab, Hospital, Server, Military, House)
  - Dynamic position calculation based on window size
  - AABB (Axis-Aligned Bounding Box) collision algorithm
  - Debug visualization function included

- **`src/lib/spriteIntegration.js`** - Sprite sheet integration guide
  - Complete setup instructions
  - Configuration examples
  - Asset organization guidelines

### Modified Files
- **`src/pages/Map.jsx`** - Integrated Character component into map

## How to Use

### Playing the Game
1. Navigate to `http://localhost:5173/mission/map`
2. Use **Arrow Keys** or **WASD** to move the character
3. Character will:
   - Stop at screen edges
   - Stop when hitting buildings
   - Flip sprite when moving left
   - Animate walking when moving

### Movement Controls
```
↑ Arrow Up    / W  → Move Up
↓ Arrow Down  / S  → Move Down
← Arrow Left  / A  → Move Left
→ Arrow Right / D  → Move Right
```

### Current Placeholder Sprite
The character currently uses a pink placeholder box (64×64px). This will be replaced with your actual sprite sheet.

## Integration with Sprite Sheets

### When You Have Your Sprite Assets:

1. **Place sprite files** in `/public/assets/sprites/`:
   - `idle.png` - Single frame, 64×64px
   - `walk.png` - 4 frames horizontal, 256×64px (4×64)

2. **Update Character.jsx** - Replace the placeholder rendering:
   ```jsx
   // OLD (remove this):
   <div className="sprite" style={{ backgroundColor: "rgba(255, 200, 200, 0.5)" ... }} />

   // NEW (add this):
   <div className="sprite" style={{
     backgroundImage: `url('/assets/sprites/${animationState}.png')`,
     backgroundPosition: `-${currentFrame * spriteConfig.frameWidth}px 0`,
     backgroundSize: `${spriteConfig.frameCount * spriteConfig.frameWidth}px ${spriteConfig.frameHeight}px`,
     backgroundRepeat: 'no-repeat',
   }} />
   ```

3. **Adjust SPRITE_CONFIG** if your frames are a different size:
   ```javascript
   const SPRITE_CONFIG = {
     idle: {
       frameWidth: 64,   // Adjust if needed
       frameHeight: 64,
       frameCount: 1,
       frameDuration: 100,
     },
     walk: {
       frameWidth: 64,
       frameHeight: 64,
       frameCount: 4,    // Must match actual frame count
       frameDuration: 100,
     },
   };
   ```

## Architecture & Features

### Movement System
- **60 FPS update loop** - Smooth, responsive movement
- **Velocity-based** - Easy to adjust speed (currently 5px per frame)
- **Dead input handling** - Respects key release events

### Collision Detection
```javascript
// Building positions dynamically calculated:
- Lab (top-left): 5%, 5% from viewport
- Hospital (top-right): 5%, 5% from viewport
- Server (center): 30%, 25% from viewport
- Military (bottom-left): 5%, 0% from viewport
- House (bottom-right): 5%, 5% from viewport

// Character collision box is 32×32px (centered in sprite)
```

### Animation System
- **State-based animation** - Separate configs per state
- **Frame interpolation** - Smooth frame advancement
- **Automatic timing** - frameDuration controls speed
- **Extensible** - Easy to add run, jump, interact states

### Sprite Flipping
- Horizontal flip using CSS `scaleX(-1)` transform
- Preserves sprite alignment
- No additional image assets needed

## Configuration & Tweaking

### Adjust Movement Speed
In `Character.jsx`, change `SPEED` constant:
```javascript
const SPEED = 5;  // pixels per frame at 60 FPS
// Increase for faster movement, decrease for slower
```

### Adjust Animation Timing
In `Character.jsx`, update `SPRITE_CONFIG`:
```javascript
walk: {
  frameDuration: 100,  // milliseconds per frame
  // Lower = faster animation (50-75 for running)
  // Higher = slower animation (150+ for heavy steps)
},
```

### Adjust Collision Boundaries
In `src/lib/collisionDetection.js`, modify building percentages:
```javascript
const percentLeft = 30;   // Position from left edge
const width = 500;        // Building width
```

### Debug Mode
To visualize collision boxes, open browser console and run:
```javascript
// First, export the function from collisionDetection.js
window.visualizeCollisionBoxes()
```

## Performance Notes
- Movement loop: 60 FPS (every 16.67ms)
- Collision checking: Per-frame, all 5 buildings
- Animation updates: Only when moving
- Memory: Minimal (no sprite preloading needed)

## Future Enhancements
- Add more animation states (run, jump, interact)
- Implement NPC characters
- Add dialogue/interaction zones
- Sound effects for footsteps
- Inventory system integration
- Camera following (for larger maps)

## Common Issues & Fixes

### Character not moving
- Check browser console for errors
- Verify Character component is imported in Map.jsx
- Ensure window event listeners are attached

### Collisions not working
- Check that collisionDetection.js is imported
- Verify building positions in CSS match collision.js
- Use debug visualization to check boxes

### Animation not playing
- Verify sprite files exist in `/public/assets/sprites/`
- Check file names match `animationState` values
- Confirm SPRITE_CONFIG frameCount matches actual frames

### Sprite looks pixelated/blurry
- This is intentional! Uses `image-rendering: crisp-edges`
- Ensure sprite PNG is actual pixels, not scaled image
- For clearer look, use higher resolution sprites (128×128px)

## File Structure
```
src/
├── components/
│   ├── Character.jsx          ← Main movement component
│   └── Character.css          ← Character styling
├── lib/
│   ├── collisionDetection.js  ← Building collision system
│   └── spriteIntegration.js   ← Sprite setup guide
└── pages/
    └── Map.jsx                ← Updated with Character

public/assets/sprites/         ← Add sprite files here
├── idle.png                   ← When you have assets
└── walk.png
```

---

You're all set! The system is ready to use. Once you have your sprite assets, just follow the integration steps above. Happy developing! 🎮
