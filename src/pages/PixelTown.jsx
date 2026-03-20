import React, { useEffect, useRef } from 'react';
import '../styles/PixelTown.css';

const PixelTown = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Color palette - limited, retro 16-bit style
    const colors = {
      veryDarkBlue: '#0a0e27',
      darkBlue: '#1a1f4a',
      mediumBlue: '#2a2f6a',
      darkPurple: '#3d1f47',
      mediumPurple: '#5d3f67',
      darkRed: '#8a0000',
      brightRed: '#ff0033',
      neonRed: '#ff3366',
      darkGreen: '#1a3d1a',
      darkGray: '#2d2d2d',
      mediumGray: '#4a4a4a',
      lightGray: '#6a6a6a',
      darkBrown: '#3d2817',
      mediumBrown: '#5d4229',
      lightBrown: '#7d5a39',
      black: '#000000',
      darkTeal: '#0d3a3a',
      yellow: '#ffdd00',
      orange: '#ff8800',
    };

    // Utility function to draw pixel-perfect rectangles
    const drawRect = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    // Draw sky with storm effect
    const drawSky = () => {
      // Base dark sky
      for (let y = 0; y < 540; y += 10) {
        const gradient = Math.sin(y / 100) * 0.1 + 0.9;
        const color = interpolateColor(colors.veryDarkBlue, colors.darkPurple, gradient);
        drawRect(0, y, 1920, 10, color);
      }

      // Red lightning strikes
      const drawLightning = (startX, startY, length) => {
        const segments = 8;
        let x = startX;
        let y = startY;
        for (let i = 0; i < segments; i++) {
          const nextX = x + (Math.random() - 0.5) * 40;
          const nextY = y + (length / segments);
          drawLine(x, y, nextX, nextY, colors.brightRed, 3);
          drawLine(x, y, nextX, nextY, colors.neonRed, 1);
          x = nextX;
          y = nextY;
        }
      };

      // Draw a few random lightning strikes
      if (Math.random() > 0.85) {
        drawLightning(Math.random() * 1920, 0, 300);
      }
      if (Math.random() > 0.87) {
        drawLightning(Math.random() * 1920, 0, 280);
      }
    };

    // Draw ground/night background
    const drawGround = () => {
      for (let y = 540; y < 1080; y += 10) {
        const variation = Math.sin(y / 50) * 0.05 + 0.95;
        const color = interpolateColor(colors.veryDarkBlue, colors.darkBlue, variation);
        drawRect(0, y, 1920, 10, color);
      }
    };

    // Draw pixelated fog overlay
    const drawFog = () => {
      ctx.globalAlpha = 0.15;
      for (let y = 400; y < 900; y += 15) {
        for (let x = 0; x < 1920; x += 20) {
          if (Math.random() > 0.5) {
            drawRect(x, y, 20, 15, colors.mediumBlue);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    // Draw forest area (outside walls)
    const drawForest = () => {
      const forestY = 200;
      const forestHeight = 680;

      // Dark forest areas
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const baseX = 960 + Math.cos(angle) * 850;
        const baseY = 540 + Math.sin(angle) * 400;
        drawTreeCluster(baseX, baseY);
      }

      // Forest edges
      ctx.fillStyle = colors.darkGreen;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(0, 0, 1920, 150);
      ctx.fillRect(0, 850, 1920, 230);
      ctx.globalAlpha = 1;
    };

    // Draw tree cluster
    const drawTreeCluster = (x, y) => {
      for (let i = 0; i < 3; i++) {
        const offsetX = x + (Math.random() - 0.5) * 40;
        const offsetY = y + (Math.random() - 0.5) * 40;
        drawTree(offsetX, offsetY);
      }
    };

    // Draw a single tree (pixel art)
    const drawTree = (x, y) => {
      // Trunk
      drawRect(x - 2, y - 4, 4, 8, colors.darkBrown);
      // Canopy
      drawRect(x - 6, y - 12, 12, 8, colors.darkGreen);
      drawRect(x - 8, y - 8, 16, 6, colors.darkGreen);
    };

    // Draw octagonal town walls with gap
    const drawWalls = () => {
      const centerX = 960;
      const centerY = 540;
      const wallRadius = 550;
      const wallColor = colors.mediumGray;
      const thickness = 20;

      // Draw octagon
      const sides = 8;
      for (let i = 0; i < sides; i++) {
        const angle1 = (i / sides) * Math.PI * 2;
        const angle2 = ((i + 1) / sides) * Math.PI * 2;

        const x1 = centerX + Math.cos(angle1) * wallRadius;
        const y1 = centerY + Math.sin(angle1) * wallRadius;
        const x2 = centerX + Math.cos(angle2) * wallRadius;
        const y2 = centerY + Math.sin(angle2) * wallRadius;

        drawThickLine(x1, y1, x2, y2, thickness, wallColor);

        // Add crenellations (wall notches)
        for (let j = 0; j < 4; j++) {
          const t = j / 4;
          const px = x1 + (x2 - x1) * t;
          const py = y1 + (y2 - y1) * t;
          drawRect(px - 8, py - 8, 16, 16, colors.lightGray);
        }
      }
    };

    // Draw watchtowers on wall corners
    const drawWatchtowers = () => {
      const centerX = 960;
      const centerY = 540;
      const towerRadius = 550;
      const sides = 8;

      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * towerRadius;
        const y = centerY + Math.sin(angle) * towerRadius;

        // Tower structure
        drawRect(x - 15, y - 15, 30, 30, colors.darkGray);
        drawRect(x - 12, y - 20, 24, 8, colors.mediumGray);

        // Spotlight beam
        drawSpotlight(x, y - 20, angle);
      }
    };

    // Draw spotlight beam
    const drawSpotlight = (x, y, angle) => {
      const beamLength = 300;
      const beamWidth = 80;

      const endX = x + Math.cos(angle) * beamLength;
      const endY = y + Math.sin(angle) * beamLength;

      ctx.globalAlpha = 0.15;
      ctx.fillStyle = colors.yellow;

      // Draw triangle spotlight beam
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX - beamWidth / 2 * Math.sin(angle), endY + beamWidth / 2 * Math.cos(angle));
      ctx.lineTo(endX + beamWidth / 2 * Math.sin(angle), endY - beamWidth / 2 * Math.cos(angle));
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    // Draw road around town
    const drawRoad = () => {
      const centerX = 960;
      const centerY = 540;
      const roadRadius = 470;
      const roadWidth = 60;

      // Draw circular road segments with dashed pattern
      for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
        const innerRadius = roadRadius - roadWidth / 2;
        const outerRadius = roadRadius + roadWidth / 2;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        drawThickLine(x1, y1, x2, y2, 40, colors.darkGray);
      }

      // Draw road markings
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        const x = centerX + Math.cos(angle) * roadRadius;
        const y = centerY + Math.sin(angle) * roadRadius;
        drawRect(x - 8, y - 4, 16, 8, colors.yellow);
      }
    };

    // Draw central lab building
    const drawCentralLab = () => {
      const centerX = 960;
      const centerY = 540;

      // Main building - octagonal
      const labRadius = 80;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const angle2 = ((i + 1) / 8) * Math.PI * 2;

        const x1 = centerX + Math.cos(angle) * labRadius;
        const y1 = centerY + Math.sin(angle) * labRadius;
        const x2 = centerX + Math.cos(angle2) * labRadius;
        const y2 = centerY + Math.sin(angle2) * labRadius;

        drawThickLine(x1, y1, x2, y2, 15, colors.darkRed);
      }

      // Core glow
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 3; i++) {
        drawCircle(centerX, centerY, labRadius - i * 8, colors.brightRed);
      }
      ctx.globalAlpha = 1;

      drawCircle(centerX, centerY, labRadius - 20, colors.brightRed);

      // Center core
      drawRect(centerX - 30, centerY - 30, 60, 60, colors.brightRed);
      ctx.globalAlpha = 0.8;
      drawRect(centerX - 25, centerY - 25, 50, 50, colors.neonRed);
      ctx.globalAlpha = 1;

      // Windows with glow
      const windowPositions = [
        [-40, -40], [40, -40], [-40, 40], [40, 40],
        [-50, 0], [50, 0], [0, -50], [0, 50]
      ];

      windowPositions.forEach(([ox, oy]) => {
        const wx = centerX + ox;
        const wy = centerY + oy;
        drawRect(wx - 8, wy - 8, 16, 16, colors.brightRed);
        ctx.globalAlpha = 0.7;
        drawRect(wx - 4, wy - 4, 8, 8, colors.neonRed);
        ctx.globalAlpha = 1;
      });
    };

    // Draw surrounding houses
    const drawHouses = () => {
      const centerX = 960;
      const centerY = 540;
      const houseRadius = 350;
      const numHouses = 12;

      for (let i = 0; i < numHouses; i++) {
        const angle = (i / numHouses) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * houseRadius;
        const y = centerY + Math.sin(angle) * houseRadius;
        drawHouse(x, y, angle);
      }
    };

    // Draw a single house
    const drawHouse = (x, y, angle) => {
      const size = 40;
      const rot = Math.atan2(y - 540, x - 960);

      // Main structure
      drawRect(x - size / 2, y - size / 2, size, size, colors.mediumBrown);
      drawRect(x - size / 2 + 2, y - size / 2 + 2, size - 4, size - 4, colors.darkBrown);

      // Roof (dark triangle)
      ctx.fillStyle = colors.mediumGray;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y - size / 2);
      ctx.lineTo(x + size / 2, y - size / 2);
      ctx.lineTo(x, y - size / 2 - 15);
      ctx.fill();

      // Windows
      drawRect(x - 10, y - 8, 8, 8, colors.darkRed);
      drawRect(x + 2, y - 8, 8, 8, colors.darkRed);
      ctx.globalAlpha = 0.4;
      drawRect(x - 10, y - 8, 8, 8, colors.brightRed);
      drawRect(x + 2, y - 8, 8, 8, colors.brightRed);
      ctx.globalAlpha = 1;

      // Door
      drawRect(x - 4, y + 4, 8, 12, colors.darkGray);
    };

    // Draw utility function
    const drawLine = (x1, y1, x2, y2, color, width) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const drawThickLine = (x1, y1, x2, y2, width, color) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const px = -dy / dist * (width / 2);
      const py = dx / dist * (width / 2);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1 + px, y1 + py);
      ctx.lineTo(x2 + px, y2 + py);
      ctx.lineTo(x2 - px, y2 - py);
      ctx.lineTo(x1 - px, y1 - py);
      ctx.fill();
    };

    const drawCircle = (x, y, radius, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Color interpolation for gradients
    const interpolateColor = (color1, color2, t) => {
      const c1 = parseInt(color1.slice(1), 16);
      const c2 = parseInt(color2.slice(1), 16);

      const r1 = (c1 >> 16) & 255;
      const g1 = (c1 >> 8) & 255;
      const b1 = c1 & 255;

      const r2 = (c2 >> 16) & 255;
      const g2 = (c2 >> 8) & 255;
      const b2 = c2 & 255;

      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };

    // Main rendering function
    const render = () => {
      // Clear canvas
      ctx.fillStyle = colors.veryDarkBlue;
      ctx.fillRect(0, 0, 1920, 1080);

      // Draw in order (back to front)
      drawSky();
      drawGround();
      drawForest();
      drawWalls();
      drawRoad();
      drawCentralLab();
      drawHouses();
      drawWatchtowers();
      drawFog();

      // Add scanline effect for retro feel
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = colors.black;
      for (let y = 0; y < 1080; y += 2) {
        ctx.fillRect(0, y, 1920, 1);
      }
      ctx.globalAlpha = 1;
    };

    render();

    // Animation loop for flickering lights and occasional lightning
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      if (frameCount % 10 === 0) {
        render();
      }
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="pixel-town-container">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="pixel-town-canvas"
      />
      <div className="pixel-town-title">HAWKINS PHENOMENON - AERIAL VIEW</div>
    </div>
  );
};

export default PixelTown;
