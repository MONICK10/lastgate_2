import "./Task1.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { GameContext } from "../context/GameContext";
import Particles3D from "../components/Particles3D";
import NetworkingScreen from "./NetworkingScreen";

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
COLLECTABLES
========================= */
function Collectables({ playerRef, onCollect, garageRef }) {

  const groupRef = useRef();
  const itemRefs = useRef({});
  const items = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const loader = useRef(new THREE.TextureLoader());
  const itemTypes = ["pc", "server", "cable", "router", "switch"];

  // Load textures
  const textures = useRef({
    pc: loader.current.load("/assets/pc.png"),
    server: loader.current.load("/assets/server.png"),
    cable: loader.current.load("/assets/cable.png"),
    router: loader.current.load("/assets/router.png"),
    switch: loader.current.load("/assets/switch.png")
  });

  const colors = {
    pc: "#00aaff",
    server: "#aa00ff",
    cable: "#ff8800",
    router: "#00ffff",
    switch: "#00ff88"
  };

  // Get floor position using raycasting
  const getFloorPosition = useCallback(() => {
    if (!garageRef.current) return null;

    // Random X/Z within reasonable range
    const x = THREE.MathUtils.randFloat(-200, 200);
    const z = THREE.MathUtils.randFloat(-200, 200);

    // Cast ray downward from high above
    const origin = new THREE.Vector3(x, 100, z);
    const direction = new THREE.Vector3(0, -1, 0);

    raycaster.current.set(origin, direction);

    // Raycast against all children in the garage
    const intersects = raycaster.current.intersectObjects(
      garageRef.current.children,
      true
    );

    // Return first valid intersection point
    if (intersects.length > 0) {
      const point = intersects[0].point;
      return new THREE.Vector3(point.x, point.y + 0.3, point.z);
    }

    return null;
  }, [garageRef]);

  // Generate spawn positions for all items
  useEffect(() => {
    if (!garageRef.current) return;

    const newItems = [];
    let itemId = 0;

    // Spawn 5 of each type (25 total)
    itemTypes.forEach(type => {
      for (let i = 0; i < 10; i++) {
        let position = null;
        let attempts = 0;

        // Retry up to 20 times to find valid floor position
        while (!position && attempts < 20) {
          position = getFloorPosition();
          attempts++;
        }

        if (position) {
          newItems.push({
            id: itemId,
            type,
            position: new THREE.Vector3(position.x, position.y + 0.7, position.z),
            baseY: position.y + 0.7,
            visible: true,
            scale: 1.4,
            opacity: 1,
            collecting: false,
            collectTime: 0
          });
          itemId++;
        }
      }
    });

    items.current = newItems;
  }, [getFloorPosition, garageRef]);

  // Animations and collection
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const playerPos = playerRef.current.position;
    const time = state.clock.getElapsedTime();

    items.current.forEach(item => {
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

        if (item.opacity <= 0) {
          item.visible = false;
        }
        return;
      }

      if (!item.visible) return;

      // Start collection when player gets very close (< 2 units)
      if (distance < 2) {
        item.collecting = true;
        onCollect(item.type);
        return;
      }

      // Floating animation - move up and down smoothly
      const floatOffset = Math.sin(time * 2) * 0.25;
      mesh.position.y = item.baseY + floatOffset;

      // Hover effect - scale up when player is close (< 4 units)
      const targetScale = distance < 4 ? 1.6 : 1.4;
      item.scale = THREE.MathUtils.lerp(item.scale, targetScale, 0.1);
      mesh.scale.set(item.scale, item.scale, item.scale);

      // Coin-like rotation around Y axis
      mesh.rotation.y += 0.03;
    });
  });

  return (
    <group ref={groupRef}>
      {items.current.map(item => {
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
              map={textures.current[item.type]}
              transparent
              opacity={1}
            />
          </sprite>
        );
      })}
    </group>
  );

}

/* =========================
MISSION AREA
========================= */
function MissionArea({ playerRef, inventory, onMissionComplete }) {
  const meshRef = useRef();
  const [unlocked, setUnlocked] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Unlock area when all items collected
  useEffect(() => {
    const allCollected = Object.values(inventory).every((v) => v === 5);
    if (allCollected) setUnlocked(true);
  }, [inventory]);

  useFrame(() => {
    if (!playerRef.current || !meshRef.current) return;
    if (!unlocked || completed) return;

    const distance = playerRef.current.position.distanceTo(meshRef.current.position);
    if (distance < 2.5) {
      // Player entered mission area
      setCompleted(true);
      onMissionComplete();
    }

    // Hover glow effect when unlocked
    if (unlocked) {
      meshRef.current.material.opacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.005);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <cylinderGeometry args={[2, 2, 2, 32]} />
      <meshStandardMaterial
        color={unlocked ? "yellow" : "gray"}
        transparent
        opacity={0.2}
      />
    </mesh>
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
CAMERA
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
MAIN
========================= */
export default function Task1() {

  const playerRef = useRef();
  const garageRef = useRef();

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

  const [playerPos, setPlayerPos] = useState({
    x: 0,
    y: 0,
    z: 0
  });

  const [inventory,setInventory] = useState({
    pc:0,
    server:0,
    cable:0,
    switch:0,
    router:0
  });

  const { completeTask } = useContext(GameContext);
  const navigate = useNavigate();

  const handleUpdatePosition = (pos) => {
    setPlayerPos(pos);
  };

  const handleCollect=(type)=>{

    setInventory(prev=>{

      const updated={
        ...prev,
        [type]:Math.min(prev[type]+1,5)
      };

      if(
        updated.pc===5 &&
        updated.server===5 &&
        updated.cable===5 &&
        updated.switch===5 &&
        updated.router===5
      ){

        alert("All network components collected!");

        completeTask(1);
        setTimeout(()=>navigate("/networking"),500);

      }

      return updated;

    });

  };

  useEffect(()=>{

    const canvas=document.querySelector("canvas");

    if(!canvas) return;

    const click=()=>canvas.requestPointerLock();

    canvas.addEventListener("click",click);

    return()=>canvas.removeEventListener("click",click);

  },[]);

  return(

    <div style={{width:"100vw",height:"100vh"}}>



      <Canvas camera={{position:[0,5,10],fov:60}} shadows>

        <color attach="background" args={["#05070d"]}/>
        <fog attach="fog" args={["#0a0f1c",10,60]}/>

        <ambientLight intensity={0.25}/>
        <directionalLight position={[5,15,5]} intensity={0.8} castShadow/>

        <Particles3D />

        <Suspense fallback={null}>

          <Garage garageRef={garageRef}/>

          <Character
            playerRef={playerRef}
            garageRef={garageRef}
            onUpdatePosition={handleUpdatePosition}
          />

          <CameraFollow target={playerRef}/>

          <Collectables
            playerRef={playerRef}
            onCollect={handleCollect}
            garageRef={garageRef}
          />
          <MissionArea
  playerRef={playerRef}
  inventory={inventory}
  onMissionComplete={() => {
    alert("Entering Networking Screen!"); // optional debug
    navigate("/missionnetworking");
  }}
/>

          {demoPositions.map((pos, index) => (
            <Demogorgon
              key={index}
              playerRef={playerRef}
              startPos={pos}
            />
          ))}

        </Suspense>

      </Canvas>

      {/* DEBUG: Player Position Panel */}
      <div className="coords">
        <div>X: {playerPos.x}</div>
        <div>Y: {playerPos.y}</div>
        <div>Z: {playerPos.z}</div>
      </div>

      {/* Inventory UI Overlay */}
      <div className="inventory">
        <div>PC {inventory.pc}/5</div>
        <div>Server {inventory.server}/5</div>
        <div>Cable {inventory.cable}/5</div>
        <div>Switch {inventory.switch}/5</div>
        <div>Router {inventory.router}/5</div>
      </div>

    </div>

  );

}