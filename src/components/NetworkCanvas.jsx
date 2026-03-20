import React, { useCallback, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Device image map - using PNG assets
const DEVICE_IMAGES = {
  pc: '/assets/pc.png',
  server: '/assets/server.png',
  router: '/assets/router.png',
  switch: '/assets/switch.png',
  firewall: '/assets/router.png', // Fallback to router
};

// Add CSS for animations
const STYLES = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 12px currentColor; }
    50% { box-shadow: 0 0 25px currentColor; }
    100% { box-shadow: 0 0 12px currentColor; }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .node-pulse { animation: pulse 2s ease-in-out infinite; }
  .node-glow { animation: glow 1.5s ease-in-out infinite; }
  .node-slide-in { animation: slide-in 0.4s ease-out; }
  
  .react-flow { 
    background: linear-gradient(135deg, #0a0e1a 0%, #14192f 100%);
  }
  
  .cable-drawing-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
  
  .cable-line {
    stroke: #ff8800;
    stroke-width: 2;
    fill: none;
    opacity: 0.6;
    pointer-events: auto;
    cursor: crosshair;
  }
`;

// Custom Node Component
const CustomNode = ({ data, selected, isConnecting }) => {
  const borderColor = data.borderColor || '#00ff00';
  const bgColor = data.isOnline ? 'rgba(0, 255, 0, 0.1)' : 'rgba(100, 100, 100, 0.05)';
  const deviceImage = DEVICE_IMAGES[data.deviceType] || DEVICE_IMAGES.router;
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        data.onNodeClick?.(data.id);
      }}
      onMouseDown={data.onCableStart}
      onMouseUp={data.onCableEnd}
      className={data.isOnline && data.status !== 'ok' ? 'node-pulse' : data.isOnline ? 'node-glow' : ''}
      style={{
        padding: '12px',
        borderRadius: '6px',
        border: selected ? '3px solid #ffff00' : `2px solid ${borderColor}`,
        backgroundColor: bgColor,
        color: '#fff',
        fontSize: '12px',
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: selected 
          ? '0 0 25px #ffff00, inset 0 0 10px rgba(255, 255, 0, 0.3)'
          : `0 0 12px ${borderColor}`,
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
      }}
    >
      {/* Device Image */}
      <img 
        src={deviceImage}
        alt={data.label}
        style={{
          width: '40px',
          height: '40px',
          opacity: data.isOnline ? 1 : 0.5,
          filter: data.status === 'error' ? 'hue-rotate(0deg) brightness(1.2) saturate(1.5)' : 'none',
          pointerEvents: 'none',
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* Status indicator and label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '10px', color: data.isOnline ? '#00ff00' : '#ff3333' }}>
          {data.isOnline ? '●' : '⊙'}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{data.label}</span>
      </div>

      {/* IP Address */}
      <div style={{ fontSize: '8px', color: '#aaa' }}>
        {data.ip ? data.ip.substring(0, 13) : 'N/A'}
      </div>

      {/* Gateway Status */}
      {data.gateway && (
        <div style={{ 
          fontSize: '8px', 
          color: data.gatewayError ? '#ff6600' : '#00ffaa',
          fontWeight: data.gatewayError ? 'bold' : 'normal'
        }}>
          {data.gatewayError ? '⚠ GW Error' : 'GW OK'}
        </div>
      )}

      {/* Status badge */}
      {data.status && (
        <div style={{ 
          fontSize: '10px', 
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: '3px',
          backgroundColor: data.status === 'ok' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 51, 51, 0.2)',
          color: data.status === 'ok' ? '#00ff00' : '#ff3333',
          marginTop: '2px',
        }}>
          {data.status === 'ok' ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function NetworkCanvas({
  devices,
  connections,
  packets,
  selectedDeviceForConfig,
  onNodeClick,
  onAddDevice,
  onAddConnection,
}) {
  const [draggedDevice, setDraggedDevice] = useState(null);
  const [drawingCable, setDrawingCable] = useState(null); // { fromId, fromPos, currentPos }
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ============ CABLE DRAWING HANDLERS (before nodes useMemo!) ============
  const handleNodeMouseDown = useCallback((deviceId, deviceX, deviceY, e) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Calculate node center position relative to container
    const nodeX = deviceX + 50; // Approximate node width
    const nodeY = deviceY + 50; // Approximate node height

    setDrawingCable({
      fromId: deviceId,
      fromPos: { x: nodeX, y: nodeY },
      currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    });
  }, []);

  const handleContainerMouseMove = useCallback((e) => {
    setDrawingCable(prev => {
      if (!prev) return null;

      const container = containerRef.current;
      if (!container) return prev;

      const rect = container.getBoundingClientRect();
      return {
        ...prev,
        currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      };
    });
  }, []);

  const handleNodeMouseUp = useCallback((deviceId, e) => {
    setDrawingCable(prev => {
      if (!prev || prev.fromId === deviceId) return null;

      // Check if connection already exists
      const connectionExists = connections.some(
        (c) => (c.from === prev.fromId && c.to === deviceId) ||
               (c.from === deviceId && c.to === prev.fromId)
      );

      if (!connectionExists && onAddConnection) {
        onAddConnection({
          from: prev.fromId,
          to: deviceId,
          active: false,
        });
      }

      return null;
    });
  }, [connections, onAddConnection]);

  const handleContainerMouseUp = useCallback(() => {
    setDrawingCable(null);
  }, []);

  // Create nodes from devices
  const nodes = useMemo(() => {
    return Object.entries(devices).map(([key, device]) => {
      // Determine device type from device name
      const deviceType = device.name.toLowerCase().includes('pc') ? 'pc' :
                        device.name.toLowerCase().includes('server') ? 'server' :
                        device.name.toLowerCase().includes('router') ? 'router' :
                        device.name.toLowerCase().includes('switch') ? 'switch' : 'firewall';

      return {
        id: key,
        data: {
          id: key,
          label: device.name.split('-')[0],
          ip: device.ip,
          gateway: device.gateway,
          isOnline: device.powerState === 'on',
          borderColor: device.powerState === 'on' 
            ? (device.misconfigured ? '#ff3333' : '#00ff00') 
            : '#555',
          status: device.misconfigured ? 'error' : device.powerState === 'on' ? 'ok' : null,
          onNodeClick,
          zone: device.zone,
          deviceType,
          devicePosition: { x: device.x, y: device.y },
          onCableStart: (e) => handleNodeMouseDown(key, device.x, device.y, e),
          onCableEnd: (e) => handleNodeMouseUp(key, e),
        },
        position: { x: device.x, y: device.y },
        type: 'custom',
        draggable: true,
      };
    });
  }, [devices, onNodeClick, handleNodeMouseDown, handleNodeMouseUp]);

  // Create edges from connections
  const edges = useMemo(() => {
    return connections.map((conn, idx) => ({
      id: `${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      animated: conn.active,
      style: {
        stroke: conn.active ? '#00ff00' : '#666',
        strokeWidth: conn.active ? 2.5 : 2,
        opacity: conn.active ? 0.8 : 0.3,
      },
      markerEnd: { color: conn.active ? '#00ff00' : '#666' },
    }));
  }, [connections]);

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  // Keep nodes and edges synced
  React.useEffect(() => {
    setNodesState(nodes);
  }, [nodes, setNodesState]);

  React.useEffect(() => {
    setEdgesState(edges);
  }, [edges, setEdgesState]);

  const onConnect = useCallback((connection) => {
    // Connections are handled externally, not by React Flow
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDraggedDevice(e.dataTransfer.getData('device'));
  };

  const handleDragLeave = () => {
    setDraggedDevice(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const deviceData = e.dataTransfer.getData('device');
    if (!deviceData || !onAddDevice) return;

    try {
      const device = JSON.parse(deviceData);
      // Get canvas position and calculate drop position
      const canvas = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - canvas.left;
      const y = e.clientY - canvas.top;
      
      onAddDevice(device, { x, y });
      setDraggedDevice(null);
    } catch (err) {
      console.error('Failed to parse dropped device:', err);
    }
  };

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = STYLES;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
    >
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#0a0e1a" />
        <Controls />
        <MiniMap 
          style={{
            backgroundColor: 'rgba(0, 20, 40, 0.5)',
            border: '1px solid #00ff00',
          }}
          nodeColor={(node) => {
            if (node.data.status === 'error') return '#ff3333';
            if (node.data.isOnline) return '#00ff00';
            return '#555';
          }}
        />

        {/* PACKET ANIMATIONS as SVG overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* CABLE DRAWING OVERLAY */}
          {drawingCable && (
            <g>
              {/* Cable line */}
              <line
                x1={drawingCable.fromPos.x}
                y1={drawingCable.fromPos.y}
                x2={drawingCable.currentPos.x || drawingCable.fromPos.x}
                y2={drawingCable.currentPos.y || drawingCable.fromPos.y}
                stroke="#ff8800"
                strokeWidth="3"
                opacity="0.8"
                strokeDasharray="5,5"
              />
              {/* Connection point circles */}
              <circle
                cx={drawingCable.fromPos.x}
                cy={drawingCable.fromPos.y}
                r="8"
                fill="#ff8800"
                opacity="0.6"
              />
              <circle
                cx={drawingCable.currentPos.x || drawingCable.fromPos.x}
                cy={drawingCable.currentPos.y || drawingCable.fromPos.y}
                r="6"
                fill="#ffaa00"
                opacity="0.4"
              />
            </g>
          )}

          {/* PACKET ANIMATIONS */}
          {packets.map((packet) => {
            const sourceNode = nodesState.find(n => n.id === packet.from);
            const targetNode = nodesState.find(n => n.id === packet.to);

            if (!sourceNode || !targetNode) return null;

            const x1 = sourceNode.position.x + 40;
            const y1 = sourceNode.position.y + 40;
            const x2 = targetNode.position.x + 40;
            const y2 = targetNode.position.y + 40;

            const packetX = x1 + (x2 - x1) * packet.progress;
            const packetY = y1 + (y2 - y1) * packet.progress;

            const statusColor =
              packet.status === 'success' ? '#ffff00' :
              packet.status === 'failed' ? '#ff3333' :
              '#00aaff';

            return (
              <g key={packet.id}>
                <circle cx={packetX} cy={packetY} r="6" fill={statusColor} opacity="0.4" />
                <circle cx={packetX} cy={packetY} r="3" fill={statusColor} opacity="0.8" />
                {packet.progress > 0.1 && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={packetX}
                    y2={packetY}
                    stroke={statusColor}
                    strokeWidth="1"
                    opacity="0.2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </ReactFlow>
    </div>
  );
}
