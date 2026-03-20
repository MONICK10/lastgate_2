import "./Task1.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

/* =========================
   GARAGE
========================= */
function Garage({ garageRef }) {
  const { scene } = useGLTF("/assets/sci1.glb");

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
      position={[0, 0, 0]}
    />
  );
}

/* =========================
   CHARACTER
========================= */
function Character({ playerRef, garageRef }) {
  const modelRef = useRef();
  const currentAction = useRef(null);
  const isPerformingAction = useRef(false);

  const walkGltf = useGLTF("/assets/Walking (1).glb");
  const jumpGltf = useGLTF("/assets/jump.glb");
  const actionGltf = useGLTF("/assets/action.glb");

  const { actions: walkActions } = useAnimations(
    walkGltf.animations,
    modelRef
  );
  const { actions: jumpActions } = useAnimations(
    jumpGltf.animations,
    modelRef
  );
  const { actions: actionActions } = useAnimations(
    actionGltf.animations,
    modelRef
  );

  const walkName = walkGltf.animations[0]?.name;
  const jumpName = jumpGltf.animations[0]?.name;
  const actionName = actionGltf.animations[0]?.name;

  const keys = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const downRay = useRef(new THREE.Raycaster());
  const forwardRay = useRef(new THREE.Raycaster());

  const PLAYER_HEIGHT = 1.6;
  const COLLISION_DISTANCE = 0.7;

  const fadeToAction = (actionObj, name, loop = true) => {
    if (!actionObj?.[name]) return;

    if (currentAction.current) {
      currentAction.current.fadeOut(0.2);
    }

    const action = actionObj[name];
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.fadeIn(0.2).play();

    currentAction.current = action;
  };

  const stopCurrent = () => {
    if (currentAction.current) {
      currentAction.current.fadeOut(0.2);
      currentAction.current = null;
    }
  };

  /* =========================
     KEYBOARD
  ========================= */
  useEffect(() => {
    const down = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === "ArrowUp") keys.current.up = true;
      if (e.key === "ArrowDown") keys.current.down = true;

      if (e.key === "j" && !isPerformingAction.current) {
        isPerformingAction.current = true;
        fadeToAction(jumpActions, jumpName, false);

        setTimeout(() => {
          isPerformingAction.current = false;
          stopCurrent();
        }, 800);
      }

      if (e.key === "a" && !isPerformingAction.current) {
        isPerformingAction.current = true;
        fadeToAction(actionActions, actionName, false);

        setTimeout(() => {
          isPerformingAction.current = false;
          stopCurrent();
        }, 1000);
      }
    };

    const up = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === "ArrowUp") keys.current.up = false;
      if (e.key === "ArrowDown") keys.current.down = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [jumpActions, actionActions]);

  /* =========================
     FRAME LOOP
  ========================= */
  useFrame((state, delta) => {
    if (!playerRef.current || !garageRef.current) return;

    const speed = 5 * delta;
    const rotSpeed = 3 * delta;

    const previousPosition = playerRef.current.position.clone();

    const camera = state.camera;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const moving = keys.current.up || keys.current.down;

    if (moving && walkName && !isPerformingAction.current) {
      if (!currentAction.current) {
        fadeToAction(walkActions, walkName, true);
      }
    }

    if (!moving && !isPerformingAction.current) {
      stopCurrent();
    }

    /* LEFT / RIGHT ROTATION */
    if (keys.current.left) {
      playerRef.current.rotation.y += rotSpeed;
    }

    if (keys.current.right) {
      playerRef.current.rotation.y -= rotSpeed;
    }

    /* FORWARD (CAMERA ALIGNED) */
    if (keys.current.up) {
      const targetAngle = Math.atan2(forward.x, forward.z);

      playerRef.current.rotation.y = THREE.MathUtils.lerp(
        playerRef.current.rotation.y,
        targetAngle,
        0.15
      );

      playerRef.current.position.add(
        forward.clone().multiplyScalar(speed)
      );
    }

    if (keys.current.down) {
      playerRef.current.position.add(
        forward.clone().multiplyScalar(-speed)
      );
    }

    /* WALL COLLISION */
    const rayOrigin = playerRef.current.position.clone();
    rayOrigin.y += 1;

    forwardRay.current.set(rayOrigin, forward);

    const hits = forwardRay.current.intersectObject(
      garageRef.current,
      true
    );

    if (hits.length > 0) {
      const hit = hits[0];

      const normal = hit.face?.normal?.clone();
      if (normal) {
        normal.transformDirection(hit.object.matrixWorld);
      }

      const isWall = normal && Math.abs(normal.y) < 0.5;

      if (hit.distance < COLLISION_DISTANCE && isWall) {
        playerRef.current.position.copy(previousPosition);
        return;
      }
    }

    /* GROUND CHECK */
    const pos = playerRef.current.position;

    downRay.current.set(
      new THREE.Vector3(pos.x, 50, pos.z),
      new THREE.Vector3(0, -1, 0)
    );

    const downHit = downRay.current.intersectObject(
      garageRef.current,
      true
    );

    if (downHit.length > 0) {
      const groundY = downHit[0].point.y;
      pos.y = groundY + PLAYER_HEIGHT;
    } else {
      playerRef.current.position.copy(previousPosition);
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <group ref={modelRef}>
        <primitive
          object={walkGltf.scene}
          scale={0.3}
          position={[0, -1.4, 0]}
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement) {
        yaw.current -= e.movementX * 0.002;
        pitch.current -= e.movementY * 0.002;

        pitch.current = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, pitch.current)
        );
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame((state) => {
    if (!target.current) return;

    const player = target.current;
    const distance = 6;
    const height = 2;

    const direction = new THREE.Vector3();
    direction.x = Math.sin(yaw.current) * Math.cos(pitch.current);
    direction.y = Math.sin(pitch.current);
    direction.z = Math.cos(yaw.current) * Math.cos(pitch.current);

    const cameraPosition = player.position
      .clone()
      .add(direction.multiplyScalar(-distance));

    cameraPosition.y += height;

    state.camera.position.lerp(cameraPosition, 0.1);

    state.camera.lookAt(
      player.position.x,
      player.position.y + 1.2,
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

  useEffect(() => {
    const canvas = document.querySelector("canvas");

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }} shadows>
        <color attach="background" args={["#0f0f0f"]} />
        <fog attach="fog" args={["#0f0f0f", 40, 120]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
        />

        <Suspense fallback={null}>
          <Garage garageRef={garageRef} />
          <Character playerRef={playerRef} garageRef={garageRef} />
          <CameraFollow target={playerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}