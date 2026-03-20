import React, { useEffect, useState } from 'react';

/**
 * MessageAnimation Component
 * Displays animated packets traveling along edges in the network
 */
export default function MessageAnimation({ 
  packets = [], 
  connections = [], 
  devices = {} 
}) {
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    // Update animations when packets change
    setAnimations(
      packets.map((packet) => ({
        ...packet,
        startTime: Date.now(),
        duration: 2000, // 2 second animation
      }))
    );
  }, [packets]);

  useEffect(() => {
    if (animations.length === 0) return;

    const interval = setInterval(() => {
      setAnimations((prev) =>
        prev
          .map((anim) => {
            const elapsed = Date.now() - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            return { ...anim, progress };
          })
          .filter((anim) => anim.progress < 1)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [animations.length]);

  const getPacketPosition = (packet) => {
    const connection = connections.find(
      (c) => c.from === packet.from && c.to === packet.to
    );

    if (!connection) return null;

    const fromDevice = devices[packet.from];
    const toDevice = devices[packet.to];

    if (!fromDevice || !toDevice) return null;

    // Interpolate position
    const x = fromDevice.x + (toDevice.x - fromDevice.x) * packet.progress;
    const y = fromDevice.y + (toDevice.y - fromDevice.y) * packet.progress;

    return { x, y };
  };

  return (
    <g style={{ pointerEvents: 'none' }}>
      {animations.map((anim) => {
        const pos = getPacketPosition(anim);
        if (!pos) return null;

        const isSuccess = anim.status === 'success';
        const isFailed = anim.status === 'failed';

        return (
          <g key={anim.id}>
            {/* Glow effect */}
            {isSuccess && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={15}
                fill={`rgba(0, 255, 0, ${0.3 * (1 - anim.progress)})`}
                style={{
                  filter: 'blur(8px)',
                }}
              />
            )}

            {/* Packet dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill={isFailed ? '#ff6600' : isSuccess ? '#00ff00' : '#00aaff'}
              opacity={0.9}
              style={{
                filter: `drop-shadow(0 0 ${isFailed ? 8 : 6}px ${
                  isFailed ? '#ff6600' : isSuccess ? '#00ff00' : '#00aaff'
                })`,
              }}
            />

            {/* Status icon */}
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#000"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {isSuccess ? '✓' : isFailed ? '✗' : '→'}
            </text>
          </g>
        );
      })}
    </g>
  );
}
