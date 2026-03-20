# Smooth Player Collision Implementation Instructions

## Overview
This document provides step-by-step instructions for implementing smooth collision handling in the React Three Fiber game to prevent the player character from getting stuck when moving near Demogorgon enemies or walls.

## Files Modified
- `src/pages/Task1.jsx` - Main game logic

## Implementation Steps

### Step 1: Create Reference Array for Demogorgons
In the Task1 component, add a useRef array to store references to all Demogorgon instances:

```javascript
const demoRefs = useRef([]);
```

### Step 2: Pass Ref Callback to Each Demogorgon
When mapping over demoPositions to create Demogorgon components, pass a ref callback:

```javascript
{demoPositions.map((pos, index) => (
  <Demogorgon
    key={index}
    playerRef={playerRef}
    startPos={pos}
    demoRef={(ref) => demoRefs.current[index] = ref}
  />
))}
```

### Step 3: Update Demogorgon Component to Accept demoRef Prop
Modify the Demogorgon function signature to accept the demoRef prop and use it to register the internal ref:

```javascript
function Demogorgon({ playerRef, startPos, demoRef }) {
  // ... existing code ...
  
  const demoRefInner = useRef();
  // ... other refs ...
  
  // Update the passed ref with the internal ref
  useEffect(() => {
    if (demoRef) {
      demoRef(demoRefInner.current);
    }
  }, [demoRef]);
  
  // ... rest of component ...
}
```

### Step 4: Replace Snap-Back Collision with Push-Out Logic
In the Character component's useFrame collision handling, replace the snap-back logic with push-out logic:

**Before:**
```javascript
if(hit.distance < COLLISION_DISTANCE && isWall){
// Only snap back if collision is significant
if(hit.distance > 0.1){
    playerRef.current.position.copy(previousPosition);
    return;
}
}
```

**After:**
```javascript
// Push out instead of snapping back
if(hit.distance < COLLISION_DISTANCE && isWall && normal){
  const push = normal.clone().multiplyScalar(COLLISION_DISTANCE - hit.distance);
  push.y = 0; // only push horizontally
  playerRef.current.position.add(push);
}
```

### Step 5: Include Enemies in Forward Ray Intersection
Modify the forward raycasting to check against both the garage and all Demogorgons:

**Before:**
```javascript
const hits = forwardRay.current.intersectObject(
  garageRef.current,
  true
);
```

**After:**
```javascript
// Check collisions with both garage and all demogorgons
const collisionObjects = [garageRef.current, ...demoRefs.current].filter(Boolean);
const hits = forwardRay.current.intersectObjects(
  collisionObjects,
  true
);
```

### Step 6: Reduce Collision Distance for Smoother Movement
Adjust the COLLISION_DISTANCE constant to allow for smoother movement:

**Before:**
```javascript
const COLLISION_DISTANCE = 0.5;
```

**After:**
```javascript
const COLLISION_DISTANCE = 0.4;
```

### Step 7: Fix Collectibles Visibility for Raycasting
In the Collectables component's useFrame, ensure mesh visibility is updated to match item.visible:

Add inside the items.current.forEach loop, after updating mesh properties:
```javascript
// Update visibility
mesh.visible = item.visible;
```

### Step 8: Fix Demogorgon Caught Ref
In the Demogorgon component, move the caught ref outside the useFrame loop to prevent recreation each frame:

Move `const caught = useRef(false);` to be outside the useFrame callback, near other ref declarations.

## Verification
After implementing these changes:
1. The player should no longer get stuck when approaching walls or Demogorgons
2. The player should be smoothly pushed away when intersecting with objects
3. All Demogorgons should be included in collision detection
4. Existing animations (walk, run, jump) should remain functional
5. The game should remain playable as before
6. Collectibles should not cause phantom collisions after being collected
7. Demogorgon catch detection should work reliably

## Testing Tips
- Test collision with walls by running into the garage structure
- Test collision with Demogorgons by approaching them from various angles
- Verify that the player slides smoothly along surfaces when colliding at an angle
- Ensure that jumping and other movements still work correctly
- Test collecting items to ensure they disappear and don't cause collision issues
- Test being caught by a Demogorgon to ensure the alert works properly