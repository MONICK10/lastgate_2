# Product Requirements Document: Smooth Player Collision With Walls and Enemies

## Title
Smooth Player Collision With Walls and Enemies

## Description
In the current React Three Fiber game, the player character sometimes freezes when approaching Demogorgons or walls. The game needs smooth collision handling so that the player is pushed out gently instead of freezing.

## User Stories

### As a player, I want to move near Demogorgons without getting stuck, so the gameplay feels smooth.
- Currently, when the player character (Eleven) collides with a Demogorgon or wall, the movement freezes
- The player gets stuck and cannot move until they move away from the collision
- This creates a frustrating gameplay experience
- With smooth collision handling, the player will be gently pushed away from obstacles, allowing continuous movement

### As a developer, I want collision detection that works with multiple enemies, so I don’t have to rewrite the logic for each enemy.
- Currently, collision detection only checks against the garage walls
- Each new enemy type would require modifying the collision logic
- By storing all Demogorgon refs in an array and checking against all of them, the system scales to any number of enemies
- New enemy types can be added without changing the core collision logic

### As a designer, I want existing animations (walk/run/jump) to remain intact, so the game feels natural.
- The player character has distinct animations for walking, running, and jumping
- These animations should continue to work as before
- Collision handling should not interfere with animation playback
- The visual feedback should remain consistent with the game's design

## Functional Requirements

### Store all Demogorgon refs in a demoRefs array.
- Create a useRef array in the Task1 component to hold references to all Demogorgon instances
- This array will be updated as Demogorgon components mount and unmount
- The array will be used in collision detection to check against all enemies

### Pass a demoRef prop to each Demogorgon.
- When rendering Demogorgon components, pass a ref callback function
- This callback will receive the DOM reference of each Demogorgon instance
- The callback will store the reference in the appropriate index of the demoRefs array

### Update Character collision logic:
- Raycast should check both walls (garageRef) and enemies (demoRefs)
- Player should be smoothly pushed out if intersecting an object
- Avoid snapping back to previous position
- Reduce collision distance slightly for smoother movement
- Maintain existing raycasting logic for floor detection and forward movement

## Technical Requirements

### Use THREE.Raycaster for collisions.
- Continue using the existing THREE.Raycaster instances (downRay and forwardRay)
- Modify the forward raycasting to check against multiple objects
- Use the normal vector from raycast hits to calculate push direction

### Keep all animations working via useAnimations.
- Do not modify the animation systems for the player or enemies
- Ensure that useFrame callbacks for animations continue to function
- Verify that walk, run, and jump animations play correctly during and after collisions

### Compatible with existing Task1 React Three Fiber structure.
- Make minimal changes to preserve the existing architecture
- Use the same hooks (useRef, useFrame, useEffect) as the existing code
- Follow the same patterns for refs and state management

### Include hooks (useRef, useFrame, useEffect) as needed.
- useRef for storing references to objects and arrays
- useFrame for per-frame collision detection and response
- useEffect for setting up ref callbacks and cleanup

## Acceptance Criteria

### Player never freezes near enemies or walls.
- When the player collides with a wall or Demogorgon, movement continues smoothly
- The player is pushed away from the obstacle rather than stopping completely
- No situation occurs where the player becomes completely immobilized by collision

### Player smoothly slides away when in collision.
- When moving at an angle into a wall or enemy, the player slides along the surface
- The push force is proportional to the penetration depth
- Movement feels natural and responsive, not jerky or abrupt

### All Demogorgons are included in collision detection.
- The collision system checks against every Demogorgon in the demoRefs array
- New Demogorgons added to the scene are automatically included in collision detection
- No Demogorgon is missed due to indexing or reference issues

### Animations remain functional.
- Walking, running, and jumping animations play correctly
- Animation transitions are not disrupted by collision handling
- The visual appearance of the player remains consistent with design specifications

### The game remains playable as before.
- All existing game mechanics continue to work (collectibles, mission areas, etc.)
- The difficulty and feel of gameplay are preserved
- No new bugs or regressions are introduced by the collision changes

## Implementation Details

### Data Structures
- `demoRefs`: useRef array storing references to all Demogorgon instances
- `COLLISION_DISTANCE`: constant defining how close the player can get to objects before being pushed out

### Algorithms
1. **Collision Detection**: 
   - Use forwardRay to cast a ray in the player's movement direction
   - Check for intersections with [garageRef.current, ...demoRefs.current].filter(Boolean)
   - Process the closest hit (first in the array)

2. **Collision Response**:
   - If hit.distance < COLLISION_DISTANCE and the hit is against a wall (normal.y < 0.5):
     - Calculate push vector: normal.clone().multiplyScalar(COLLISION_DISTANCE - hit.distance)
     - Apply push: playerRef.current.position.add(push)
   - This pushes the player out along the surface normal by the penetration depth

3. **Reference Management**:
   - Each Demogorgon receives a demoRef prop
   - The Demogorgon uses useEffect to call demoRef(demoRefInner.current) when the prop changes
   - This ensures the parent's demoRefs array stays updated with current references

### Configuration
- Reduced COLLISION_DISTANCE from 0.5 to 0.4 for smoother movement
- This allows the player to get slightly closer to objects before being pushed out
- Results in less abrupt collision response

## Open Issues
- None identified at this time

## Dependencies
- React Three Fiber (@react-three/fiber)
- React Three Drei (@react-three/drei)
- Three.js (three)
- These are already used in the existing codebase

## Timeline
- Estimated implementation time: 2-4 hours
- Includes: coding, testing, and verification