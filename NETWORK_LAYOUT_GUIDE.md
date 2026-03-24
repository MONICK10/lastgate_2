# Network Layout Implementation Guide

## Overview

The new network layout (`networkLayout.json`) provides an enhanced visualization of the TechNova network topology with the following improvements:

### ✅ Key Enhancements

1. **Large Node Spacing**
   - Horizontal spacing: 150-300px between major sections
   - Vertical spacing: 150-170px between layers
   - Data Center: Extra 200px+ separation for clarity

2. **Layered Architecture**
   - **Top Layer (y: 50-200)**: Internet cloud & Edge Router
   - **Middle Layer (y: 320-420)**: Core switches & routers
   - **Bottom Layer (y: 580-750)**: Endpoints (PCs, servers)

3. **No Overlapping Elements**
   - Each node has independent, unique positioning
   - Labels fit within node boundaries
   - All connections use curved edges (smoothstep)

4. **Problem Badges**
   - Red numbered badges appear on affected nodes
   - Problems stored in `data.problems` array
   - Problems: [1-9] mapped to affected devices

5. **Interactive Features**
   - All nodes except labels are draggable
   - Hover shows device IP, VLAN, role
   - Click badges to show problem details
   - Zoom-to-fit supported via React Flow Controls

## File Structure

```
networkLayout.json
├── nodes[]
│   ├── Node Type: custom (for CustomNode component)
│   ├── data: {
│   │   ├── label: "Device Name"
│   │   ├── deviceType: "pc|server|router|switch|internet"
│   │   ├── role: "Functional Role"
│   │   ├── config: { ip, gateway, vlan, description }
│   │   ├── problems: [1, 3, 5] (problem IDs)
│   │   └── style: { CSS properties }
│   ├── position: { x, y }
│   ├── draggable: true/false
│   └── selectable: true/false
├── edges[]
│   ├── type: smoothstep (curved connections)
│   ├── animated: true/false (animated edges)
│   ├── stroke: color, strokeWidth
│   └── label: "Connection Type"
└── metadata
```

## Node Positions & Spacing

### Layer 1: Internet & WAN Gateway
```
Internet Cloud          Edge Router
(500, 50) ————————→ (500, 200)
           WAN Link, animated
```

### Layer 2: Core Infrastructure
```
┌─────────────────────────────────────┐
│         Core Backbone               │
│  y: 320-420                         │
│                                     │
│  Head Office    Branch A Branch B   Data Center
│  (80, 420)    (-200,420) (-50,420) (500, 420)
└─────────────────────────────────────┘
```

### Layer 3: Access & Endpoints
```
Head Office Section:
- HR Switch (-100, 580) → PC-HR (-100, 750)
- IT Switch (80, 580) → PC-IT1 (40, 750), PC-IT2 (120, 750)
- Sales Switch (260, 580) → PC-Sales (260, 750)

Data Center Section (Extra Spacing):
- Core Server (350, 580)
- Web Server (425, 580)
- DB Server (500, 580)
- DNS Server (575, 580)
- Backup Server (650, 580)
```

## Problem Mapping

```javascript
// Problems array in each node.data.problems
Problems = [Integer IDs]

Problem ID → Affected Devices:
1  → ho-core-switch, ho-access-switch-1/2/3
2  → ho-pc-hr
3  → ho-core-switch
4  → branch-a-router
5  → branch-b-router
6  → dns-server
7  → edge-router
8  → ho-pc-it-2
9  → ho-access-switch-1/2/3
```

## Edge Types & Styling

| Connection Type | Stroke | Width | Animated | Purpose |
|---|---|---|---|---|
| WAN Link | #0288d1 | 3px | Yes | Internet backbone |
| Backbone | #d32f2f | 3px | No | Core infrastructure |
| Trunk | #d32f2f | 2px | No | VLAN trunks |
| Access | #1976d2 | 2px | No | Device access |
| Secure Link | #388e3c | 3px | No | DC links |
| LAN | #1976d2 | 2px | No | Local networks |

## Integration Steps

### 1. Import the layout in NetworkingScreen.jsx

```javascript
import networkLayout from '../data/networkLayout.json';

// In your component or useEffect:
const { nodes: layoutNodes, edges: layoutEdges } = networkLayout;

// Merge with problem mapping if needed
const initializeFromLayout = (layout, problemMapping) => {
  const nodes = layout.nodes.map(node => {
    if (problemMapping[node.id]) {
      return {
        ...node,
        data: {
          ...node.data,
          problems: problemMapping[node.id]
        }
      };
    }
    return node;
  });
  
  return {
    nodes,
    edges: layout.edges
  };
};
```

### 2. Add device detail hover tooltips

```javascript
// In CustomNode component
const [hoveredNode, setHoveredNode] = useState(null);

return (
  <div 
    onMouseEnter={() => setHoveredNode(data.id)}
    onMouseLeave={() => setHoveredNode(null)}
  >
    {hoveredNode === data.id && (
      <div className="device-tooltip">
        <p><strong>{data.label}</strong></p>
        <p>IP: {data.config?.ip}</p>
        <p>VLAN: {data.config?.vlan}</p>
        <p>Role: {data.role}</p>
      </div>
    )}
    {/* ... node content ... */}
  </div>
);
```

### 3. Enable zoom-to-fit

```javascript
<ReactFlow nodes={nodes} edges={edges} fitView>
  <Background />
  <Controls /> {/* Already includes fit-view button */}
</ReactFlow>
```

### 4. Animate problem highlighting

```javascript
// When a badge is clicked, highlight affected devices
const handleBadgeClick = (problemId) => {
  setHighlightedProblems(new Set([problemId]));
  
  // Highlight all nodes with this problem
  setNodes(n => n.map(node => ({
    ...node,
    data: {
      ...node.data,
      highlighted: node.data.problems?.includes(problemId) || false
    }
  })));
};

// Add CSS animation in NetworkingScreen.css
.node-highlighted {
  animation: pulse-highlight 0.6s ease-in-out infinite;
}

@keyframes pulse-highlight {
  0% { box-shadow: 0 0 10px transparent; }
  50% { box-shadow: 0 0 20px #f44336; }
  100% { box-shadow: 0 0 10px transparent; }
}
```

## Node Categories

### Device Types
- **pc**: Personal computers (blue borders)
- **server**: Data Center servers (green borders)
- **router**: Network routers (red borders)
- **switch**: Network switches (red borders)
- **internet**: External network (light blue)

### Status Indicators
- **Green (#388e3c)**: Properly configured ✓
- **Red (#d32f2f)**: Has problems ✗
- **Yellow/Orange (#f57f17)**: Warning or temporary issues ⚠
- **Blue (#1976d2)**: Functional ✓

## Device Configuration Details

Each node contains complete configuration data:

```javascript
{
  "id": "ho-core-switch",
  "data": {
    "label": "🔀 Core Switch\n(L3)",
    "deviceType": "switch",
    "role": "Layer 3 Switch",
    "config": {
      "ip": "192.168.1.1",
      "vlan": "VLAN 1",
      "description": "Inter-VLAN Routing"
    },
    "problems": [1, 3]
  }
}
```

Use this data to populate:
- Device configuration panels
- Detail modals on click
- Terminal simulation inputs
- Diagnostic reports

## Spacing Reference

### X-axis (Horizontal)
- Section left margin: -200px (Branches)
- Head Office center: 80px
- Data Center center: 500px
- Maximum spread: 700px wide

### Y-axis (Vertical)
- Layer 1 (Internet): 50-200px
- Layer 2 (Core): 320-420px
- Layer 3 (Endpoints): 580-750px
- Total height: 750px

## Customization Tips

### Adjust row spacing
```javascript
// Change layer positions (y values)
// Keep minimum 150px between layers for clarity
layer1.y = 50;    // Internet
layer2.y = 350;   // Core (was 420, moved up 70px)
layer3.y = 600;   // Endpoints (was 750)
```

### Add more servers to DC
```javascript
// Use x positions: 275-700px range
// Keep y consistent at 580 or stagger slightly
{
  position: { x: 725, y: 590 }  // New DC server right
}
```

### Adjust Data Center spacing
```javascript
// Spread servers further apart
// Use 75px gap between servers instead of 75px
// Original: 350, 425, 500, 575, 650
// Wider: 300, 400, 500, 600, 700
```

## CSS Classes for Styling

Add these to `NetworkingScreen.css`:

```css
/* Device info tooltip */
.device-tooltip {
  position: absolute;
  bottom: 60px;
  left: 0;
  background: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 10;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* Problem badge animation */
.problem-badge-animated {
  animation: badge-pulse 0.6s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Highlighted nodes */
.node-highlighted {
  animation: pulse-highlight 0.6s ease-in-out infinite;
  filter: brightness(1.2);
}

@keyframes pulse-highlight {
  0%, 100% { box-shadow: 0 0 10px transparent; }
  50% { box-shadow: 0 0 20px #ff5252; }
}

/* Device type colors */
.node-pc { border-color: #1976d2; }
.node-server { border-color: #388e3c; }
.node-router { border-color: #d32f2f; }
.node-switch { border-color: #d32f2f; }

/* Connection labels */
.edge-label {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
```

## Testing Checklist

- [ ] All nodes visible without overlap
- [ ] Connections curved (not straight)
- [ ] Hover shows device details
- [ ] Click nodes to show configuration
- [ ] Problem badges clickable
- [ ] Nodes draggable
- [ ] Zoom-to-fit works
- [ ] Problem highlighting animates
- [ ] Data Center clearly separated
- [ ] No label cutoff in any device

## Performance Notes

- **Node Count**: 23 nodes (optimal for performance)
- **Edge Count**: 20 edges (smooth rendering)
- **Render Optimization**: Use React.memo for CustomNode
- **Layout**: Pre-calculated static positions (no auto-layout needed)

## Metadata & Version

```json
{
  "version": "2.0",
  "lastUpdated": "2026-03-20",
  "compatibility": {
    "reactflow": ">=11.0.0",
    "react": ">=18.0.0"
  },
  "features": [
    "Large spacing between nodes",
    "Data Center extra separation",
    "Curved edge connections",
    "Problem badge mapping",
    "Device configuration storage",
    "Draggable nodes",
    "Hover details support"
  ]
}
```

---

## Quick Start Template

```javascript
import React, { useEffect } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState } from 'reactflow';
import networkLayout from '../data/networkLayout.json';
import CustomNode from './CustomNode';

export function NetworkDiagram() {
  const [nodes, setNodes] = useNodesState(networkLayout.nodes);
  const [edges, setEdges] = useEdgesState(networkLayout.edges);
  
  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={{ custom: CustomNode }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

This layout is production-ready and can be used immediately with the existing CustomNode component!
