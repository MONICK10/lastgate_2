import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Particles3D() {
  const particlesRef = useRef(null);
  const particlesDataRef = useRef([]);

  useEffect(() => {
    if (!particlesRef.current) return;

    const COUNT = 400;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const particlesData = [];

    // Initialize particles
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = Math.random() * 300 - 50;
      const z = (Math.random() - 0.5) * 500;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      particlesData.push({
        x,
        y,
        z,
        baseY: y,
        speedY: Math.random() * 0.08 + 0.02, // Very slow falling
        speedX: Math.random() * 0.15 - 0.075,
        speedZ: Math.random() * 0.15 - 0.075,
        size: Math.random() * 4 + 1.5,
        opacity: Math.random() * 0.3 + 0.15,
      });
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      sizes[i] = particlesData[i].size;
    }
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xb0b0b0,
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current.add(particles);

    particlesDataRef.current = particlesData;

    return () => {
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  useFrame(() => {
    if (!particlesRef.current || particlesRef.current.children.length === 0)
      return;

    const particles = particlesRef.current.children[0];
    const positions = particles.geometry.attributes.position.array;
    const particlesData = particlesDataRef.current;

    for (let i = 0; i < particlesData.length; i++) {
      const p = particlesData[i];

      // Movement - very slow descent
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.005) * 0.2;
      p.z += p.speedZ + Math.cos(p.y * 0.005) * 0.2;

      // Reset only when particle goes VERY far down (accumulation effect)
      if (p.y < -200) {
        p.y = 250;
        p.x = (Math.random() - 0.5) * 500;
        p.z = (Math.random() - 0.5) * 500;
      }

      // Update position array
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }

    particles.geometry.attributes.position.needsUpdate = true;
  });

  return <group ref={particlesRef} />;
}
