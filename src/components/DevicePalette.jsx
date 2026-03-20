import React, { useState } from 'react';

/**
 * DevicePalette Component
 * Provides draggable device types for adding to network canvas
 */
export default function DevicePalette({ onDeviceSelect, className = '' }) {
  const [draggedDevice, setDraggedDevice] = useState(null);

  const deviceTypes = [
    { id: 'pc', label: 'PC', icon: '💻', color: '#00aaff', description: 'Personal Computer' },
    { id: 'router', label: 'Router', icon: '🔀', color: '#00ffff', description: 'Network Router' },
    { id: 'server', label: 'Server', icon: '🖥️', color: '#aa00ff', description: 'Server' },
    { id: 'switch', label: 'Switch', icon: '🔌', color: '#00ff88', description: 'Network Switch' },
    { id: 'firewall', label: 'Firewall', icon: '🛡️', color: '#ff6600', description: 'Firewall' },
  ];

  const handleDragStart = (e, device) => {
    setDraggedDevice(device);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('device', JSON.stringify(device));
    
    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.background = device.color;
    dragImage.style.color = '#fff';
    dragImage.style.padding = '8px 12px';
    dragImage.style.borderRadius = '6px';
    dragImage.style.fontSize = '14px';
    dragImage.style.fontWeight = 'bold';
    dragImage.style.boxShadow = `0 0 10px ${device.color}`;
    dragImage.style.pointerEvents = 'none';
    dragImage.textContent = `${device.icon} ${device.label}`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggedDevice(null);
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'rgba(10, 20, 40, 0.95)',
        borderRight: '2px solid #00ff00',
        overflow: 'auto',
      }}
    >
      <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
        📦 Device Palette
      </div>

      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px', lineHeight: '1.4' }}>
        Drag devices onto the canvas to add them.
      </div>

      {deviceTypes.map((device) => (
        <div
          key={device.id}
          draggable
          onDragStart={(e) => handleDragStart(e, device)}
          onDragEnd={handleDragEnd}
          onClick={() => onDeviceSelect?.(device)}
          style={{
            padding: '12px 10px',
            backgroundColor: draggedDevice?.id === device.id 
              ? `${device.color}30` 
              : 'rgba(100, 100, 100, 0.1)',
            border: `2px solid ${device.color}`,
            borderRadius: '6px',
            cursor: 'grab',
            transition: 'all 0.2s ease',
            color: device.color,
            fontWeight: 'bold',
            fontSize: '12px',
            userSelect: 'none',
            activeStyle: { opacity: 0.7 },
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${device.color}20`;
            e.currentTarget.style.boxShadow = `0 0 15px ${device.color}40`;
          }}
          onMouseLeave={(e) => {
            if (draggedDevice?.id !== device.id) {
              e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>{device.icon}</span>
          <div style={{ flex: 1 }}>
            <div>{device.label}</div>
            <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
              {device.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
