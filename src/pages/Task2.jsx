import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Sky, PerspectiveCamera } from "@react-three/drei";
import { Vector3 } from "three";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import "./Task2.css";

// Create shared player position context
const PlayerContext = createContext();

// ============================================
// HELPER: Random Floor Position
// ============================================
const randomFloorPosition = () => {
  const x = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;
  return [x, 1, z];
};

// ============================================
// COLLECTABLES - ALPHABET LETTERS
// ============================================
function AlphabetCollectable({ letter, position, collected, onCollect }) {
  const meshRef = useRef(null);
  const playerContext = useContext(PlayerContext);
  
  useFrame(({ clock }) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.3;
      
      // Check collision with player
      if (playerContext && playerContext.position) {
        const dist = playerContext.position.distanceTo(new Vector3(...position));
        if (dist < 2) {
          onCollect(letter);
        }
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {!collected && (
        <>
          {/* Glowing sphere */}
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.5}
              wireframe={false}
            />
          </mesh>
          
          {/* Letter text */}
          <Text
            position={[0, 0, 0.6]}
            fontSize={0.8}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {letter}
          </Text>
        </>
      )}
    </group>
  );
}

// ============================================
// MISSION CYLINDER
// ============================================
function MissionCylinder({ unlocked }) {
  const meshRef = useRef(null);
  const playerContext = useContext(PlayerContext);
  const [distToCylinder, setDistToCylinder] = useState(Infinity);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      if (unlocked) {
        meshRef.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.2;
        meshRef.current.material.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.3;
      }

      // Check distance to player
      if (playerContext && playerContext.position) {
        const dist = playerContext.position.distanceTo(new Vector3(0, 1, 0));
        setDistToCylinder(dist);
        
        if (dist < 2.5 && unlocked) {
          // Mission complete!
          playerContext.onMissionComplete && playerContext.onMissionComplete();
        }
      }
    }
  });

  return (
    <mesh position={[0, 1, 0]} ref={meshRef}>
      <cylinderGeometry args={[2, 2, 2, 32]} />
      <meshStandardMaterial
        color={unlocked ? "#0066ff" : "#888888"}
        emissive={unlocked ? "#0066ff" : "#000000"}
        emissiveIntensity={unlocked ? 0.8 : 0}
        transparent
        opacity={unlocked ? 0.8 : 0.3}
      />
    </mesh>
  );
}

// ============================================
// PLAYER - ELEVEN
// ============================================
function ElevenCharacter() {
  const groupRef = useRef(null);
  const cameraRef = useRef(null);
  const playerPos = useRef(new Vector3(0, 1, -10));
  const playerContext = useContext(PlayerContext);
  const velocity = useRef(new Vector3(0, 0, 0));
  const direction = useRef(new Vector3(0, 0, 0));
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w") keys.current.w = true;
      if (key === "a") keys.current.a = true;
      if (key === "s") keys.current.s = true;
      if (key === "d") keys.current.d = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w") keys.current.w = false;
      if (key === "a") keys.current.a = false;
      if (key === "s") keys.current.s = false;
      if (key === "d") keys.current.d = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // Movement
    const moveSpeed = 0.5;
    direction.current.set(0, 0, 0);

    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    direction.current.normalize();
    velocity.current.copy(direction.current).multiplyScalar(moveSpeed);

    // Update position
    playerPos.current.add(velocity.current);
    playerPos.current.y = 1; // Keep on ground
    
    // Boundary check
    const boundary = 50;
    playerPos.current.x = Math.max(-boundary, Math.min(boundary, playerPos.current.x));
    playerPos.current.z = Math.max(-boundary, Math.min(boundary, playerPos.current.z));
    
    groupRef.current.position.copy(playerPos.current);
    
    // Update context for collision detection
    if (playerContext) {
      playerContext.position = playerPos.current.clone();
    }
  });

  return (
    <group ref={groupRef} position={playerPos.current.toArray()}>
      {/* Character body - glowing sphere with aura */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glow aura */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.2}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Camera follows character */}
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 3, 5]} />
    </group>
  );
}

// ============================================
// UPSIDE DOWN ENVIRONMENT
// ============================================
function UpsideDownEnvironment() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a0033" />
      </mesh>

      {/* Distant mountains */}
      <mesh position={[0, 40, -100]}>
        <coneGeometry args={[50, 80, 32]} />
        <meshStandardMaterial color="#220044" />
      </mesh>
      <mesh position={[50, 30, -80]}>
        <coneGeometry args={[40, 60, 32]} />
        <meshStandardMaterial color="#330055" />
      </mesh>
      <mesh position={[-50, 35, -90]}>
        <coneGeometry args={[45, 70, 32]} />
        <meshStandardMaterial color="#220044" />
      </mesh>

      {/* Blue/purple lighting */}
      <ambientLight intensity={0.3} color="#0066ff" />
      <ambientLight intensity={0.2} color="#6600ff" />
      <pointLight position={[50, 20, 50]} intensity={0.8} color="#0066ff" />
      <pointLight position={[-50, 20, -50]} intensity={0.6} color="#6600ff" />

      {/* Sky - dark upside down vibe */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.52}
        azimuth={0.25}
        rayleigh={0.5}
        turbidity={10}
      />
    </>
  );
}

// ============================================
// SCENE CONTAINER
// ============================================
function GameScene({ collectables, onCollect, onMissionComplete, unlocked }) {
  const playerContextRef = useRef({
    position: new Vector3(0, 1, -10),
    onMissionComplete,
  });

  return (
    <PlayerContext.Provider value={playerContextRef.current}>
      <UpsideDownEnvironment />

      {/* Collectables */}
      {collectables.map((item) => (
        <AlphabetCollectable
          key={item.id}
          letter={item.letter}
          position={item.position}
          collected={item.collected}
          onCollect={onCollect}
        />
      ))}

      {/* Mission Cylinder */}
      <MissionCylinder unlocked={unlocked} />

      {/* Player - Eleven */}
      <ElevenCharacter />
    </PlayerContext.Provider>
  );
}

// ============================================
// MAIN TASK2 COMPONENT
// ============================================
export default function Task2() {
  const navigate = useNavigate();
  const { completeTask } = useContext(GameContext) || { completeTask: () => {} };
  const [collectedLetters, setCollectedLetters] = useState(new Set());
  const [collectables, setCollectables] = useState([]);
  const [missionComplete, setMissionComplete] = useState(false);

  // Initialize collectables (A-Z)
  useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const items = letters.map((letter) => ({
      id: letter,
      letter: letter,
      position: randomFloorPosition(),
      collected: false,
    }));
    setCollectables(items);
  }, []);

  // Handle letter collection
  const handleCollect = (letter) => {
    setCollectedLetters((prev) => {
      const updated = new Set(prev);
      if (!updated.has(letter)) {
        updated.add(letter);
        
        // All letters collected - unlock mission
        if (updated.size === 26) {
          setMissionComplete(true);
        }
      }
      
      return updated;
    });

    // Mark as collected in collectables
    setCollectables((prev) =>
      prev.map((item) =>
        item.letter === letter ? { ...item, collected: true } : item
      )
    );
  };

  const handleMissionComplete = () => {
    // Small delay before showing completion
    setTimeout(() => {
      completeTask(3);
      navigate("/mission/task3");
    }, 500);
  };

  const unlocked = collectedLetters.size === 26;

  return (
    <div className="task2-container">
      {/* HUD - Letters Collected */}
      <div className="task2-hud">
        <div className="hud-letters">
          <h3>📜 Letters Collected</h3>
          <div className="letters-display">
            {collectedLetters.size} / 26
          </div>
          <div className="letters-grid">
            {Array.from(collectedLetters)
              .sort()
              .map((letter) => (
                <div key={letter} className="letter-item collected">
                  {letter}
                </div>
              ))}
            {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
              .filter((l) => !collectedLetters.has(l))
              .map((letter) => (
                <div key={letter} className="letter-item missing">
                  ?
                </div>
              ))}
          </div>
        </div>

        {/* Mission Status */}
        <div className="mission-status">
          {unlocked ? (
            <div className="status-unlocked">
              🔓 Mission Cylinder Unlocked!
              <p>Find the glowing cylinder to complete the mission</p>
            </div>
          ) : (
            <div className="status-locked">
              🔒 Collect all 26 letters to unlock
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="controls-info">
          <p><strong>WASD</strong> - Move</p>
          <p><strong>Mouse</strong> - Look around</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        shadows
        fog={{ attach: "fog", args: ["#0a0a1a", 10, 200] }}
      >
        <GameScene 
          collectables={collectables} 
          onCollect={handleCollect}
          onMissionComplete={handleMissionComplete}
          unlocked={unlocked}
        />
      </Canvas>

      {/* Mission Complete Overlay */}
      {missionComplete && (
        <div className="mission-complete-overlay">
          <div className="mission-complete-card">
            <h1>🎉 MISSION COMPLETE!</h1>
            <p>Eleven has restored the signal!</p>
            <p>The alphabet has been reassembled.</p>
            <button onClick={() => {
              completeTask(3);
              navigate("/mission/task3");
            }}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
