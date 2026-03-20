// Task2.jsx

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";

/* =========================
   ROAD
========================= */
function Road({ roadRef }) {
  const { scene } = useGLTF("/assets/road.glb");

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
      ref={roadRef}
      object={scene}
      scale={10}
      position={[0, -200, 0]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

/* =========================
   CHARACTER
========================= */
function Character({ playerRef, roadRef, gameStarted }) {
  const modelRef = useRef();
  const currentAction = useRef(null);

  const runGltf = useGLTF("/assets/run.glb");
  const { actions, names } = useAnimations(runGltf.animations, modelRef);
  const runName = names?.[0];

  const keys = useRef({
    left: false,
    right: false,
  });

  const downRay = useRef(new THREE.Raycaster());
  const PLAYER_HEIGHT = 1.6;

  /* =========================
     KEYBOARD INPUT
  ========================= */
  useEffect(() => {
    const down = (e) => {
      if (!gameStarted) return;

      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };

    const up = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [gameStarted]);

  /* =========================
     RUN ANIMATION
  ========================= */
  useEffect(() => {
    if (!actions || !runName) return;

    if (gameStarted) {
      const action = actions[runName];
      action.reset();
      action.setLoop(THREE.LoopRepeat);
      action.fadeIn(0.2).play();
      currentAction.current = action;
    } else {
      currentAction.current?.fadeOut(0.2);
      currentAction.current = null;
    }
  }, [gameStarted, actions, runName]);

  /* =========================
     FRAME LOOP
  ========================= */
  useFrame((state, delta) => {
    if (!playerRef.current || !roadRef.current) return;
    if (!gameStarted) return;

    const player = playerRef.current;
    const speed = 20 * delta;
    const rotSpeed = 3 * delta;

    const previousPosition = player.position.clone();

    /* LEFT / RIGHT ROTATION */
    if (keys.current.left) {
      player.rotation.y += rotSpeed;
    }

    if (keys.current.right) {
      player.rotation.y -= rotSpeed;
    }

    /* AUTO FORWARD BASED ON FACING DIRECTION */
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(player.quaternion);
    forward.normalize();

    player.position.add(forward.multiplyScalar(speed));

    /* GROUND LOCK */
    const pos = player.position;

    downRay.current.set(
      new THREE.Vector3(pos.x, 50, pos.z),
      new THREE.Vector3(0, -1, 0)
    );

    const downHit = downRay.current.intersectObject(
      roadRef.current,
      true
    );

    if (downHit.length > 0) {
      pos.y = downHit[0].point.y + PLAYER_HEIGHT;
    } else {
      player.position.copy(previousPosition);
    }
  });

  return (
    <group
      ref={playerRef}
      position={[320.05, -182.64, -297.93]}
    >
      {/* Correct 180° rotation */}
      <group ref={modelRef} rotation={[0, Math.PI*360, 0]}>
        <primitive
          object={runGltf.scene}
          scale={0.3}
          position={[0, -1.0, 0]}
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
  const pitch = useRef(-0.2);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement) {
        yaw.current -= e.movementX * 0.002;
        pitch.current -= e.movementY * 0.002;

        pitch.current = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 6, pitch.current)
        );
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!target.current) return;

    const player = target.current;

    const distance = 8;
    const height = 3;

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
      player.position.y + 1.5,
      player.position.z
    );
  });

  return null;
}

/* =========================
   MAIN
========================= */
export default function Task2() {
  const playerRef = useRef();
  const roadRef = useRef();

  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  /* Pointer Lock */
  useEffect(() => {
    const canvas = document.querySelector("canvas");

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    canvas?.addEventListener("click", handleClick);
    return () =>
      canvas?.removeEventListener("click", handleClick);
  }, []);

  /* Start Game with Countdown */
  const startGame = () => {
    setCountdown(3);
    let count = 3;

    const interval = setInterval(() => {
      count--;

      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown("GO!");

        setTimeout(() => {
          setCountdown(null);
          setGameStarted(true);
        }, 800);
      }
    }, 1000);
  };

  const stopGame = () => {
    setGameStarted(false);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* UI */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
        }}
      >
        <button onClick={startGame} style={{ marginRight: 10 }}>
          Start
        </button>

        <button onClick={stopGame}>Stop</button>
      </div>

      {countdown && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "60px",
            color: "white",
            zIndex: 20,
          }}
        >
          {countdown}
        </div>
      )}

      <Canvas camera={{ position: [0, 5, 10], fov: 50 }} shadows>
        <color attach="background" args={["#05070d"]} />
        <fog attach="fog" args={["#0a0f1c", 10, 300]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 15, 5]}
          intensity={1}
          castShadow
        />

        <Suspense fallback={null}>
          <Road roadRef={roadRef} />
          <Character
            playerRef={playerRef}
            roadRef={roadRef}
            gameStarted={gameStarted}
          />
          <CameraFollow target={playerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}