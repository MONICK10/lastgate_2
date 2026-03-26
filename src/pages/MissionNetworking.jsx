import "./Task1.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

/* =========================
GARAGE
========================= */
function Garage({ garageRef }) {

  const { scene } = useGLTF("/assets/hawk123.glb");

  useEffect(() => {

    scene.traverse((child) => {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });

  }, [scene]);

  return (
    <primitive
      ref={garageRef}
      object={scene}
      scale={1}
      position={[0,0,0]}
    />
  );

}

/* =========================
DEMOGORGON ENEMY
========================= */
function Demogorgon({ playerRef, startPos }) {

  // Store home position for territory-based AI
  const homePosition = useRef(new THREE.Vector3(startPos[0], startPos[1], startPos[2]));
  const PATROL_RADIUS = 35; // Define patrol radius
   const caught = useRef(false);
  const lastPlayerPos = useRef(new THREE.Vector3());
  const straightRunTime = useRef(0);
  const zigzagTime = useRef(0);
  const angerMode = useRef(false);
  const [isChasing, setIsChasing] = useState(false);

  const demoRef = useRef();
  const walkModelRef = useRef();
  const runModelRef = useRef();
  const currentAction = useRef(null);

  const walkGltf = useGLTF("/assets/demowalk.glb");
  const runGltf = useGLTF("/assets/demorun.glb");

  // Clone scenes for independent rendering per enemy instance
  const walkScene = useMemo(() => SkeletonUtils.clone(walkGltf.scene), [walkGltf.scene]);
  const runScene = useMemo(() => SkeletonUtils.clone(runGltf.scene), [runGltf.scene]);

  const { actions: walkActions } = useAnimations(
    walkGltf.animations,
    walkModelRef
  );

  const { actions: runActions } = useAnimations(
    runGltf.animations,
    runModelRef
  );

  const walkName = walkGltf.animations[0]?.name;
  const runName = runGltf.animations[0]?.name;

  const DETECTION_RADIUS = 35;
  const CATCH_DISTANCE = 0.2;

  // Function to generate random patrol point around home position
   const getRandomPatrolPoint = () => {
     const angle = Math.random() * Math.PI * 2;
     const radius = Math.random() * PATROL_RADIUS;
     
     return new THREE.Vector3(
       homePosition.current.x + Math.cos(angle) * radius,
       homePosition.current.y,
       homePosition.current.z + Math.sin(angle) * radius
     );
   };
  
  // Initialize patrol target to a point within patrol radius
  const patrolTarget = useRef(getRandomPatrolPoint());
  
  /* ===== 10 second chase delay ===== */
  const chaseEnabled = useRef(false);

  useEffect(()=>{

    const timer = setTimeout(()=>{

      chaseEnabled.current = true;

    },10000);

    return ()=>clearTimeout(timer);

  },[]);

  const fadeToAction = (actions,name)=>{

    if(!actions?.[name]) return;

    if(currentAction.current){
      currentAction.current.fadeOut(0.2);
    }

    const action = actions[name];
    action.reset().fadeIn(0.2).play();

    currentAction.current = action;

  };

  useEffect(()=>{

    if(walkActions && walkName){
      fadeToAction(walkActions,walkName);
    }

  },[walkActions]);

  useFrame((state, delta) => {
     if (!demoRef.current) return;

     const demo = demoRef.current;

     let target = patrolTarget.current;

     

     const WALK_SPEED = 2.5;
     const RUN_SPEED = 10.5;
     const STRAIGHT_CHASE_SPEED = 10; // matches Eleven
     const ANGER_SPEED = 9; // slightly faster

     let speed = WALK_SPEED;
     let distance = 0;

     if (playerRef.current) {
       const playerPos = playerRef.current.position;
       const dx = demo.position.x - playerPos.x;
       const dz = demo.position.z - playerPos.z;
       distance = Math.sqrt(dx * dx + dz * dz);

       /* Player enters enemy territory */
       if (chaseEnabled.current && distance < DETECTION_RADIUS) {
         setIsChasing(true);
         target = playerPos;
         /* Default chase speed */
         speed = RUN_SPEED;

         /* If Eleven runs straight for 5 seconds */
         if (straightRunTime.current > 5) {
           speed = STRAIGHT_CHASE_SPEED;
         }

         /* Zig-zag slows Demogorgon */
         if (zigzagTime.current > 1.5) {
           speed = RUN_SPEED - 2;
         }

         /* Too much zig-zag → Demogorgon anger */
         if (zigzagTime.current > 6) {
           angerMode.current = true;
         }

         if (angerMode.current) {
           speed = ANGER_SPEED;
         }

         if (currentAction.current !== runActions?.[runName]) {
           fadeToAction(runActions, runName);
         }

         // Only check catch distance when actively chasing
        

if (!caught.current && distance <= CATCH_DISTANCE) {
  caught.current = true;
  alert("Demogorgon caught Eleven!");
  window.location.reload();
}
       } else {
         /* Player escaped territory */
         setIsChasing(false);
         if (currentAction.current !== walkActions?.[walkName]) {
           fadeToAction(walkActions, walkName);
         }
       }
     } else {
       /* No player ref */
       setIsChasing(false);
       if (currentAction.current !== walkActions?.[walkName]) {
         fadeToAction(walkActions, walkName);
       }
     }

     // If not chasing and outside home radius, return home
     if (!isChasing) {
       const distanceFromHome = demo.position.distanceTo(homePosition.current);
       if (distanceFromHome > PATROL_RADIUS) {
         target = homePosition.current;
       }
     }

     const dir = new THREE.Vector3()
       .subVectors(target, demo.position)
       .normalize();

     demo.position.add(dir.multiplyScalar(speed * delta));

     if (playerRef.current) {
       const playerPos = playerRef.current.position;

       const playerMovement = new THREE.Vector3()
         .subVectors(playerPos, lastPlayerPos.current);

       const movementAmount = playerMovement.length();

       if (movementAmount > 0.05) {
         playerMovement.normalize();

         const dirToPlayer = new THREE.Vector3()
           .subVectors(playerPos, demo.position)
           .normalize();

         const alignment = playerMovement.dot(dirToPlayer);

         if (alignment > 0.9) {
           straightRunTime.current += delta;
           zigzagTime.current = 0;
         } else {
           zigzagTime.current += delta;
           straightRunTime.current = 0;
         }
       }

       lastPlayerPos.current.copy(playerPos);
     }

     demo.rotation.y = Math.atan2(dir.x, dir.z);

     if (demo.position.distanceTo(patrolTarget.current) < 2) {
       patrolTarget.current = getRandomPatrolPoint();
     }
   });

  return(

    <group ref={demoRef} position={startPos}>

      <group ref={walkModelRef} visible={!isChasing} position={[0,0,0]}>
        <primitive
          object={walkScene}
          scale={2}
          position={[0,-1,0]}
        />
      </group>

      <group ref={runModelRef} visible={isChasing} position={[0,0,0]}>
        <primitive
          object={runScene}
          scale={2}
          position={[0,-1,0]}
        />
      </group>

    </group>

  );

}

/* =========================
CHARACTER
========================= */
function Character({ playerRef, garageRef, onUpdatePosition }) {

  const modelRef = useRef();
  const currentAction = useRef(null);
  const isPerformingAction = useRef(false);

  const walkGltf = useGLTF("/assets/elwalk1.glb");
  const runGltf = useGLTF("/assets/elrun1.glb");
  const jumpGltf = useGLTF("/assets/jump.glb");
  const actionGltf = useGLTF("/assets/action.glb");

  const { actions: walkActions } = useAnimations(
    walkGltf.animations,
    modelRef
  );

  const { actions: runActions } = useAnimations(
    runGltf.animations,
    modelRef
  );

  const { actions: jumpActions } = useAnimations(
    jumpGltf.animations,
    modelRef
  );

  const walkName = "Armature|mixamo.com|Layer0";
  const runName = "Armature|mixamo.com|elrun";
  const jumpName = jumpGltf.animations[0]?.name;

  const keys = useRef({
    left:false,
    right:false,
    up:false,
    down:false,
    shift:false
  });

  const downRay = useRef(new THREE.Raycaster());
  const forwardRay = useRef(new THREE.Raycaster());

  const PLAYER_HEIGHT = 1.6;
  const COLLISION_DISTANCE = 0.5;

  const WALK_SPEED = 5;
  const RUN_MULTIPLIER = 2.2;

  const fadeToAction = (actionObj,name,loop=true)=>{

    if(!actionObj?.[name]) return;

    if(currentAction.current){
      currentAction.current.fadeOut(0.2);
    }

    const action = actionObj[name];

    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    action.clampWhenFinished=true;
    action.fadeIn(0.2).play();

    currentAction.current = action;

  };

  const stopCurrent=()=>{

    if(currentAction.current){
      currentAction.current.fadeOut(0.2);
      currentAction.current=null;
    }

  };

  useEffect(()=>{

    const down=e=>{

      if(e.key==="ArrowLeft") keys.current.left=true;
      if(e.key==="ArrowRight") keys.current.right=true;
      if(e.key==="ArrowUp") keys.current.up=true;
      if(e.key==="ArrowDown") keys.current.down=true;
      if(e.key==="Shift") keys.current.shift=true;

      if(e.key==="j" && !isPerformingAction.current){

        isPerformingAction.current=true;

        fadeToAction(jumpActions,jumpName,false);

        setTimeout(()=>{

          isPerformingAction.current=false;
          stopCurrent();

        },800);

      }

    };

    const up=e=>{

      if(e.key==="ArrowLeft") keys.current.left=false;
      if(e.key==="ArrowRight") keys.current.right=false;
      if(e.key==="ArrowUp") keys.current.up=false;
      if(e.key==="ArrowDown") keys.current.down=false;
      if(e.key==="Shift") keys.current.shift=false;

    };

    window.addEventListener("keydown",down);
    window.addEventListener("keyup",up);

    return()=>{

      window.removeEventListener("keydown",down);
      window.removeEventListener("keyup",up);

    };

  },[jumpActions]);

  useFrame((state,delta)=>{

    if(!playerRef.current || !garageRef.current) return;

    // Update position display for UI
    const p = playerRef.current.position;
    if (onUpdatePosition) {
      onUpdatePosition({
        x: parseFloat(p.x.toFixed(2)),
        y: parseFloat(p.y.toFixed(2)),
        z: parseFloat(p.z.toFixed(2))
      });
    }

    const isRunning = keys.current.shift && keys.current.up;

    const speed =
      (isRunning ? WALK_SPEED*RUN_MULTIPLIER : WALK_SPEED)*delta;

    const rotSpeed = 3*delta;

    const previousPosition = playerRef.current.position.clone();

    const camera = state.camera;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y=0;
    forward.normalize();

    const moving = keys.current.up || keys.current.down;

    if(moving && !isPerformingAction.current){

      if(isRunning && runName){

        if(currentAction.current !== runActions[runName]){
          fadeToAction(runActions,runName,true);
        }

      }else if(walkName){

        if(currentAction.current !== walkActions[walkName]){
          fadeToAction(walkActions,walkName,true);
        }

      }

    }

    if(!moving && !isPerformingAction.current){
      stopCurrent();
    }

    if(keys.current.left) playerRef.current.rotation.y += rotSpeed;
    if(keys.current.right) playerRef.current.rotation.y -= rotSpeed;

    if(keys.current.up){

      const targetAngle = Math.atan2(forward.x,forward.z);

      playerRef.current.rotation.y =
        THREE.MathUtils.lerp(
          playerRef.current.rotation.y,
          targetAngle,
          0.15
        );

      playerRef.current.position.add(
        forward.clone().multiplyScalar(speed)
      );

    }

    if(keys.current.down){

      playerRef.current.position.add(
        forward.clone().multiplyScalar(-speed)
      );

    }

    const rayOrigin = playerRef.current.position.clone();
    rayOrigin.y += 1;

    forwardRay.current.set(rayOrigin,forward);

    const hits = forwardRay.current.intersectObject(
      garageRef.current,
      true
    );

    if(hits.length>0){

      const hit = hits[0];
      const normal = hit.face?.normal?.clone();

      if(normal){
        normal.transformDirection(hit.object.matrixWorld);
      }

      const isWall = normal && Math.abs(normal.y) < 0.5;

      if(hit.distance < COLLISION_DISTANCE && isWall){
    // Only snap back if collision is significant
    if(hit.distance > 0.1){
        playerRef.current.position.copy(previousPosition);
        return;
    }
}

    }

    const pos = playerRef.current.position;

    downRay.current.set(
      new THREE.Vector3(pos.x,50,pos.z),
      new THREE.Vector3(0,-1,0)
    );

    const downHit = downRay.current.intersectObject(
      garageRef.current,
      true
    );

    if(downHit.length > 0){
    const groundY = downHit[0].point.y;
    pos.y = groundY + PLAYER_HEIGHT;
} else {
    // Don't snap back, just keep previous Y
    pos.y = previousPosition.y;
}

  });

  return(

    <group ref={playerRef} position={[0,0,0]}>

      <group ref={modelRef}>

        <primitive
          object={walkGltf.scene}
          scale={2}
          position={[0,-1,0]}
        />

      </group>

    </group>

  );

}

/* =========================
CAMERA FOLLOW
========================= */
function CameraFollow({ target }) {

  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(()=>{

    const handleMouseMove=e=>{

      if(document.pointerLockElement){

        yaw.current -= e.movementX*0.002;
        pitch.current -= e.movementY*0.002;

        pitch.current = Math.max(
          -Math.PI/3,
          Math.min(Math.PI/3,pitch.current)
        );

      }

    };

    window.addEventListener("mousemove",handleMouseMove);

    return()=>{
      window.removeEventListener("mousemove",handleMouseMove);
    };

  },[]);

  useFrame((state)=>{
    
    if(!target.current) return;

    const player = target.current;

    const distance = 6;
    const height = 2;

    const direction = new THREE.Vector3();

    direction.x = Math.sin(yaw.current)*Math.cos(pitch.current);
    direction.y = Math.sin(pitch.current);
    direction.z = Math.cos(yaw.current)*Math.cos(pitch.current);

    const cameraPosition =
      player.position.clone()
      .add(direction.multiplyScalar(-distance));

    cameraPosition.y += height;

    state.camera.position.lerp(cameraPosition,0.1);

    state.camera.lookAt(
      player.position.x,
      player.position.y+1.2,
      player.position.z
    );

  });

  return null;

}

/* =========================
COLLECTABLE LETTERS
========================= */
function CollectableLetters({ playerRef, onCollect, garageRef }) {

  const groupRef = useRef();
  const itemRefs = useRef({});
  const [items, setItems] = useState([]);
  const raycaster = useRef(new THREE.Raycaster());
  const textureCache = useRef({});

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Generate letter textures (cached for performance)
  const getLetterTexture = useCallback((letter) => {
    if (textureCache.current[letter]) {
      return textureCache.current[letter];
    }

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    
    // Cyan background
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(0, 0, 256, 256);

    // Black border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 250);

    // Black letter text
    ctx.fillStyle = "#000000";
    ctx.font = "bold 190px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    
    textureCache.current[letter] = texture;
    return texture;
  }, []);

  // Get floor position using raycasting
  const getFloorPosition = useCallback(() => {
    if (!garageRef.current) {
      console.warn("garageRef not ready");
      return null;
    }

    const x = THREE.MathUtils.randFloat(-200, 200);
    const z = THREE.MathUtils.randFloat(-200, 200);

    const origin = new THREE.Vector3(x, 100, z);
    const direction = new THREE.Vector3(0, -1, 0);

    raycaster.current.set(origin, direction);

    const intersects = raycaster.current.intersectObjects(
      garageRef.current.children,
      true
    );

    if (intersects.length > 0) {
      const point = intersects[0].point;
      console.log(`Found floor at: [${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`);
      return new THREE.Vector3(point.x, point.y + 0.3, point.z);
    }

    return null;
  }, [garageRef]);

  // Generate spawn positions for all 26 letters - WAIT FOR GARAGE TO LOAD
  useEffect(() => {
    if (!garageRef.current) {
      console.log("⏳ Waiting for garageRef to load...");
      return;
    }

    console.log("🚀 Spawning 26 letters at STATIC positions...");
    console.log("📍 All letters have fixed, consistent positions every reload");

    // STATIC positions for all 26 letters (X, Y, Z)
    // Y = 2.0 = ground level, adjust if floating above buildings
    const staticLetterPositions = {
      'A': [-42, 2.0, -17.72],      // Moved near D
      'B': [-57, 2.0, -0.61],     // Moved near E
      'C': [-106, 2.0, -18],       // Moved near D
      'D': [-107, 2.0, -64.28],
      'E': [-69, 2.0, -68],
      'F': [-103, 2.0, -102],      // Moved near E
      'G': [-79, 2.0, -104],
      'H': [-126, 2.0, -143],    // Moved near G
      'I': [7, 2.0, -72],      // Moved near K
      'J': [27, 2.0, -102],     // Moved near L
      'K': [-66, 2.0, -110],
      'L': [-43, 2.0, -167],
      'M': [-100, 2.0, -130],
      'N': [-150, 2.0, -166],
      'O': [120, 2.0, -74],
      'P': [140, 2.0, -97.05],
      'Q': [-295, 2.0, -55],
      'R': [-222, 2.0, -29],
      'S': [-175, 2.0, -135],
      'T': [-195, 2.0, -173],
      'U': [-156, 2.0, -105],
      'V': [-257.29, 2.0, -108.48],
      'W': [-40, 2.0, -70],
      'X': [-20, 2.0, -65],
      'Y': [0, 2.0, -70],
      'Z': [20, 2.0, -65]
    };

    const newItems = [];

    alphabet.forEach((letter, letterIndex) => {
      const pos = staticLetterPositions[letter];
      if (!pos) {
        console.warn(`⚠ No position defined for letter ${letter}`);
        return;
      }

      const [x, y, z] = pos;
      const floorY = y + 0.7;  // Add offset for sprite height above ground

      newItems.push({
        id: letterIndex,
        letter,
        position: new THREE.Vector3(x, floorY, z),
        baseY: floorY,
        visible: true,
        scale: 1.4,
        opacity: 1,
        collecting: false,
        collectTime: 0,
        spawnedSuccessfully: true
      });

    });

    console.log(`✅ All 26 letters spawned at STATIC positions`);
    console.log("📌 Letter positions are FIXED and consistent every reload");
    
    setItems(newItems);
  }, [garageRef]);

  // Collection animation - fade out and shrink when collected (like Task1.jsx)
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const playerPos = playerRef.current.position;

    items.forEach(item => {
      const mesh = itemRefs.current[item.id];
      if (!mesh) return;
      
      mesh.visible = item.visible;

      const distance = playerPos.distanceTo(item.position);

      // Collection phase - shrink and fade out
      if (item.collecting) {
        item.collectTime += delta;
        item.scale *= 0.92;
        item.opacity -= 0.06;

        mesh.scale.set(item.scale, item.scale, item.scale);
        mesh.material.opacity = item.opacity;

        // Hide when fully collected
        if (item.opacity <= 0) {
          item.visible = false;
        }
        return;
      }

      if (!item.visible) return;

      // Start collection when player gets very close (< 1.5 units)
      if (distance < 1.5) {
        item.collecting = true;
        console.log(`✓ Collected letter: ${item.letter}`);
        onCollect(item.letter);
        return;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {console.log("Rendering items:", items.length)}
      {items.map(item => {
        if (!item.visible) return null;

        return (
          <sprite
            key={item.id}
            ref={el => {
              if (el) itemRefs.current[item.id] = el;
            }}
            position={item.position}
            scale={[1.8, 1.8, 1.8]}
          >
            <spriteMaterial
              map={getLetterTexture(item.letter)}
              transparent
              opacity={1}
              sizeAttenuation={true}
            />
          </sprite>
        );
      })}
    </group>
  );
}

/* =========================
MAIN COMPONENT
========================= */
export default function MissionNetworking() {
  const navigate = useNavigate();
  const { user, updateScores, markModuleComplete } = useUser();
  const playerRef = useRef();
  const garageRef = useRef();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const [inventory, setInventory] = useState(
    alphabet.reduce((acc, letter) => {
      acc[letter] = 0;
      return acc;
    }, {})
  );

  const demoPositions = [
    [20, 0, -100],
    [76, 0, -71.3],
    [-71, 0, -87],
    [-132, 0, -63],
    [-237, 0, -50],
    [-268, 0, -8],
    [-286,0,-75],
    [-144,0,-103],
    [-165,0,-183],
    [-232,0,-150],
    [-177,0,-111],
    [-232,0,-76]
  ];

  const handleCollect = (letter) => {
    setInventory(prev => {
      // Don't collect if already have it
      if (prev[letter] === 1) return prev;

      const updated = { ...prev, [letter]: 1 };

      // Check if all 26 letters collected
      const allCollected = Object.values(updated).every(v => v === 1);

      if (allCollected) {
        alert("All 26 letters collected! Mission complete!");
        
        // Calculate Task2 score: 26 letters collected × 50 points each = 1300 points
        const task2Score = 26 * 50;
        
        // Mark module as complete
        markModuleComplete("task2");
        
        // Update scores with the new task2 score
        const totalScore = (user.task1Score || 0) + task2Score + (user.networkingScore || 0) + (user.caesarScore || 0) + (user.debugScore || 0);
        updateScores(user.networkingScore || 0, user.debugScore || 0, user.caesarScore || 0, totalScore, user.task1Score || 0, task2Score);
        
        // Store in temporary state to pass to navigation
        setTimeout(() => {
          navigate("/caesar");
        }, 1500);
      }

      return updated;
    });
  };

  useEffect(()=>{

    const canvas = document.querySelector("canvas");
    if(!canvas) return;

    const click=()=>canvas.requestPointerLock();
    canvas.addEventListener("click",click);

    return()=>canvas.removeEventListener("click",click);

  },[]);

  const collectedCount = Object.values(inventory).filter(v => v === 1).length;

  return(

    <div style={{width:"100vw",height:"100vh"}}>

      <Canvas camera={{position:[0,5,10],fov:60}} shadows>

        <color attach="background" args={["#05070d"]}/>
        <fog attach="fog" args={["#0a0f1c",10,60]}/>

        <ambientLight intensity={0.25}/>
        <directionalLight position={[5,15,5]} intensity={0.8} castShadow/>

        <Suspense fallback={null}>

          <Garage garageRef={garageRef}/>

          <Character
            playerRef={playerRef}
            garageRef={garageRef}
            onUpdatePosition={()=>{}}
          />

          <CameraFollow target={playerRef}/>

          <CollectableLetters
            playerRef={playerRef}
            onCollect={handleCollect}
            garageRef={garageRef}
          />

          {demoPositions.map((pos,index)=>(
            <Demogorgon
              key={index}
              playerRef={playerRef}
              startPos={pos}
            />
          ))}

        </Suspense>

      </Canvas>

      {/* Collected Letters Display */}
      <div className="inventory" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ width: "100%", marginBottom: "10px", color: "#00ffff", fontWeight: "bold" }}>
          Collected: {collectedCount} / 26
        </div>
        {alphabet.map(letter => (
          <span
            key={letter}
            style={{
              padding: "6px 10px",
              margin: "2px",
              backgroundColor: inventory[letter] === 1 ? "#00ff0055" : "#ff000055",
              color: inventory[letter] === 1 ? "#00ff00" : "#ff0000",
              border: `1px solid ${inventory[letter] === 1 ? "#00ff00" : "#ff0000"}`,
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Background Music */}
      <audio autoPlay loop style={{ display: "none" }}>
        <source src="/assets/run.mpeg" type="audio/mpeg" />
      </audio>

    </div>

  );

}
