import { useEffect, useRef } from "react";
import "./ParticlesOverlay.css";

export default function ParticlesOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const COUNT = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Create irregular particles (ash/dust effect)
    particles = Array.from({ length: COUNT }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 6 + 2,
      speedY: Math.random() * 0.3 + 0.05, // Very slow
      speedX: Math.random() * 0.2 - 0.1,
      opacity: Math.random() * 0.25 + 0.1,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.02 - 0.01,
      shapePoints: Math.floor(Math.random() * 5) + 3, // Irregular polygon
    }));

    const drawIrregularShape = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      ctx.beginPath();

      for (let i = 0; i < p.shapePoints; i++) {
        const angle = (i / p.shapePoints) * Math.PI * 2;
        const radius = p.size * (0.7 + Math.random() * 0.6);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      ctx.fillStyle = `rgba(200, 200, 200, ${p.opacity})`; // Grey ash
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Movement (floating, not falling)
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.2;

        p.angle += p.rotation;

        // Flickering opacity for realism
        p.opacity += (Math.random() - 0.5) * 0.01;
        p.opacity = Math.max(0.05, Math.min(0.35, p.opacity));

        // Reset when particle goes off screen
        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        drawIrregularShape(p);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}
