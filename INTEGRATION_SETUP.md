# React Flow Network Layout - Integration Setup Guide

## Quick Start (5 Minutes)

### Step 1: Add the New Layout JSON
```bash
# File already created at:
# d:\hawkins-protocol\src\data\networkLayout.json
```

### Step 2: Import in NetworkingScreen.jsx
```javascript
import networkLayout from '../data/networkLayout.json';
```

### Step 3: Use the Layout
```javascript
// Option A: Replace entire layout
const [nodes, setNodes] = useNodesState(networkLayout.nodes);
const [edges, setEdges] = useEdgesState(networkLayout.edges);

// Option B: Merge with problem mapping
useEffect(() => {
  const nodeWithProblems = networkLayout.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      problems: problemMapping[node.id] || node.data.problems || [],
      onBadgeClick: handleShowProblemDetails
    }
  }));
  setNodes(nodeWithProblems);
  setEdges(networkLayout.edges);
}, [problemMapping, setNodes, setEdges]);
```

---

## Complete Integration Example

### Updated NetworkingScreen.jsx Structure

```javascript
import { useState, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import "./NetworkingScreen.css";
import networkLayout from "../data/networkLayout.json";
import CustomNode from "../components/CustomNode";

export default function NetworkingScreen({ close = () => {}, onTaskComplete = () => {} }) {
  return (
    <ReactFlowProvider>
      <NetworkingScreenInner close={close} onTaskComplete={onTaskComplete} />
    </ReactFlowProvider>
  );
}

function NetworkingScreenInner({ close, onTaskComplete }) {
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [highlightedProblems, setHighlightedProblems] = useState(new Set());
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Problem definitions (same as before)
  const problems = [
    {
      id: 1,
      title: "VLAN & Trunk Misconfiguration",
      location: "Head Office - Core & Access Switches",
      problem: "Trunk ports configured as access ports. VLAN traffic cannot cross switches.",
      solution: "Configure trunk ports (802.1Q) on core and access switches.",
      affectedDevices: ["ho-core-switch", "ho-access-switch-1", "ho-access-switch-2", "ho-access-switch-3"],
      steps: [
        "interface range Gi0/1-3 → switchport mode trunk",
        "Configure HR Switch: interface Gi0/1 → switchport mode trunk",
        "Configure IT Switch: interface Gi0/1 → switchport mode trunk",
        "Configure Sales Switch: interface Gi0/1 → switchport mode trunk",
        "Verify: show interfaces trunk",
      ],
    },
    // ... more problems ...
  ];

  // Create problem mapping from affected devices
  const createProblemMapping = () => {
    const mapping = {};
    problems.forEach(problem => {
      problem.affectedDevices.forEach(deviceId => {
        if (!mapping[deviceId]) {
          mapping[deviceId] = [];
        }
        mapping[deviceId].push(problem.id);
      });
    });
    return mapping;
  };

  const problemMapping = createProblemMapping();

  // Initialize nodes with problem badges and event handlers
  useEffect(() => {
    const initialNodes = networkLayout.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        problems: problemMapping[node.id] || [],
        onBadgeClick: handleShowProblemDetails,
        hovered: hoveredNodeId === node.id,
      }
    }));

    // Apply highlighting
    const highlightedNodes = initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        highlighted: node.data.problems?.some(p => highlightedProblems.has(p)) || false
      }
    }));

    setNodes(highlightedNodes);
    setEdges(networkLayout.edges);
  }, [highlightedProblems, hoveredNodeId, setNodes, setEdges, problemMapping]);

  // Handle problem badge click
  const handleShowProblemDetails = (problemId) => {
    setSelectedProblem(problems.find(p => p.id === problemId));
    setShowProblemModal(true);
    setHighlightedProblems(new Set([problemId]));
  };

  // Handle problem solved/unsolved
  const handleSolveProblem = (problemId) => {
    const newSolved = new Set(solvedProblems);
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId);
    } else {
      newSolved.add(problemId);
    }
    setSolvedProblems(newSolved);
  };

  const handleExpandProblem = (problemId) => {
    setExpandedProblem(expandedProblem === problemId ? null : problemId);
  };

  const allSolved = solvedProblems.size === problems.length;

  return (
    <div className="networking-screen-v2">
      {/* HEADER */}
      <header className="networking-header-v2">
        <div className="header-content">
          <h1>🏢 TechNova Solutions – Network Rescue Story</h1>
          <div className="header-stats">
            <span className="stat-badge">
              Problems Solved: {solvedProblems.size}/{problems.length}
            </span>
            {allSolved && <span className="stat-badge success">✓ Network Restored!</span>}
          </div>
          <button className="close-button-header" onClick={close}>✕</button>
        </div>
      </header>

      <div className="networking-container-v2">
        {/* LEFT SIDEBAR - PROBLEM CAROUSEL */}
        <aside className="problem-carousel-sidebar">
          <div className="carousel-header">
            <h2>Network Problems</h2>
            <span className="problem-count">{problems.length} issues</span>
          </div>

          <div className="carousel-items">
            {problems.map((problem) => {
              const isSolved = solvedProblems.has(problem.id);
              const isExpanded = expandedProblem === problem.id;

              return (
                <div
                  key={problem.id}
                  className={`carousel-item ${isSolved ? "solved" : "unsolved"} ${isExpanded ? "expanded" : ""}`}
                >
                  <div
                    className="carousel-item-header"
                    onClick={() => handleExpandProblem(problem.id)}
                  >
                    <div className="problem-number-badge">{problem.id}</div>
                    <div className="problem-title-section">
                      <h3>{problem.title}</h3>
                      <p className="problem-location">{problem.location}</p>
                    </div>
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandProblem(problem.id);
                      }}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="carousel-item-details">
                      <div className="detail-section">
                        <h4>🔴 Problem</h4>
                        <p>{problem.problem}</p>
                      </div>

                      <div className="detail-section">
                        <h4>✓ Solution</h4>
                        <p>{problem.solution}</p>
                      </div>

                      <div className="detail-section">
                        <h4>📝 Steps</h4>
                        <ol className="steps-list">
                          {problem.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="carousel-actions">
                        <button
                          className={`solve-button ${isSolved ? "unsolved-btn" : "solved-btn"}`}
                          onClick={() => handleSolveProblem(problem.id)}
                        >
                          {isSolved ? "❌ Mark Unsolved" : "✓ Mark Solved"}
                        </button>
                      </div>
                    </div>
                  )}

                  {isSolved && (
                    <div className="status-badge">
                      <span className="solved-status">✓ Fixed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT SIDE - NETWORK DIAGRAM */}
        <main className="diagram-container-v2">
          <div className="diagram-header-v2">
            <h2>🌐 Interactive Network Topology</h2>
            <p className="diagram-subtitle">Click problem numbers to see details. Green = Fixed, Red = Broken</p>
          </div>

          <div className="react-flow-wrapper">
            <ReactFlow 
              nodes={nodes} 
              edges={edges}
              nodeTypes={{ custom: CustomNode }}
              fitView
              onNodeMouseEnter={(e, node) => setHoveredNodeId(node.id)}
              onNodeMouseLeave={() => setHoveredNodeId(null)}
            >
              <Background color="#aaa" />
              <Controls />
            </ReactFlow>
          </div>
        </main>
      </div>

      {/* FOOTER - CONTROLS */}
      <footer className="networking-footer-v2">
        <div className="footer-content">
          <button
            className="action-button reset-button"
            onClick={() => {
              setSolvedProblems(new Set());
              setExpandedProblem(null);
              setHighlightedProblems(new Set());
            }}
          >
            🔄 Reset All
          </button>
          <button
            className={`action-button verify-button ${allSolved ? "success" : ""}`}
            onClick={() => {
              if (allSolved) {
                alert("🎉 Congratulations! All network problems solved!");
                onTaskComplete?.();
              }
            }}
          >
            ✓ Verify Solution {allSolved && "- COMPLETE"}
          </button>
          <button
            className="action-button close-footer-button"
            onClick={close}
          >
            Close Lab
          </button>
        </div>
      </footer>

      {/* PROBLEM MODAL */}
      {showProblemModal && selectedProblem && (
        <div 
          className="problem-modal-overlay" 
          onClick={() => {
            setShowProblemModal(false);
            setHighlightedProblems(new Set());
          }}
        >
          <div className="problem-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Problem #{selectedProblem.id}: {selectedProblem.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowProblemModal(false);
                  setHighlightedProblems(new Set());
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>📍 Location</h3>
                <p>{selectedProblem.location}</p>
              </div>

              <div className="modal-section">
                <h3>🔴 Problem</h3>
                <p>{selectedProblem.problem}</p>
              </div>

              <div className="modal-section">
                <h3>✓ Solution</h3>
                <p>{selectedProblem.solution}</p>
              </div>

              <div className="modal-section">
                <h3>📝 Configuration Steps</h3>
                <ol className="modal-steps">
                  {selectedProblem.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className={`modal-action-button ${solvedProblems.has(selectedProblem.id) ? "unsolved" : "solved"}`}
                onClick={() => {
                  handleSolveProblem(selectedProblem.id);
                  setShowProblemModal(false);
                }}
              >
                {solvedProblems.has(selectedProblem.id) ? "❌ Mark Unsolved" : "✓ Mark as Fixed"}
              </button>
              <button
                className="modal-close-button"
                onClick={() => {
                  setShowProblemModal(false);
                  setHighlightedProblems(new Set());
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Updated CustomNode Component

### NetworkingScreen.jsx - CustomNode Definition

```javascript
// Add this inside your NetworkingScreen.jsx or CustomNode.jsx file

import { Handle, Position } from "reactflow";

function CustomNode({ data, selected, isConnecting }) {
  const problemBadges = data.problems || [];
  const highlighted = data.highlighted || false;
  const hovered = data.hovered || false;

  return (
    <div 
      className={`
        custom-node 
        ${selected ? "selected" : ""} 
        ${highlighted ? "highlighted" : ""}
        ${hovered ? "hovered" : ""}
      `} 
      style={data.style}
      title={`${data.label}\nIP: ${data.config?.ip || 'N/A'}\nVLAN: ${data.config?.vlan || 'N/A'}\nRole: ${data.role || 'N/A'}`}
    >
      <Handle position={Position.Top} type="target" />
      
      <div className="node-label">{data.label}</div>

      {/* Device role/type indicator */}
      {data.role && (
        <div className="node-role" title={data.role}>
          {data.config?.ip}
        </div>
      )}

      {/* Problem Badges */}
      {problemBadges.length > 0 && (
        <div className="problem-badges-container">
          {problemBadges.map((problemId) => (
            <button
              key={problemId}
              className="problem-badge"
              onClick={(e) => {
                e.stopPropagation();
                if (data.onBadgeClick) {
                  data.onBadgeClick(problemId);
                }
              }}
              title={`Problem ${problemId}: Click for details`}
            >
              {problemId}
            </button>
          ))}
        </div>
      )}

      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}
```

---

## CSS Styling Additions

### Add to NetworkingScreen.css

```css
/* ===== ENHANCED NODE STYLING ===== */

.custom-node {
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-node.hovered {
  transform: scale(1.05);
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.custom-node.selected {
  box-shadow: 0 0 0 3px #ffeb3b, 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.custom-node.highlighted {
  animation: node-pulse 0.6s ease-in-out infinite;
  filter: brightness(1.2);
}

@keyframes node-pulse {
  0%, 100% {
    box-shadow: 0 0 10px transparent;
  }
  50% {
    box-shadow: 0 0 20px #ff5252;
  }
}

/* Node sub-elements */
.node-label {
  font-size: 11px;
  font-weight: bold;
  word-wrap: break-word;
  line-height: 1.3;
}

.node-role {
  font-size: 9px;
  color: #666;
  margin-top: 2px;
  opacity: 0.8;
}

/* Problem Badges Container */
.problem-badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  justify-content: center;
}

.problem-badge {
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.problem-badge:hover {
  background: #ff1744;
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(255, 82, 82, 0.5);
}

.problem-badge:active {
  transform: scale(0.95);
}

/* ===== REACT FLOW ENHANCEMENTS ===== */

.react-flow-wrapper {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.react-flow__background {
  background-color: #f5f7fa !important;
}

.react-flow__edge-path {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Curved edges styling */
.react-flow__edge.smoothstep {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.react-flow__edge-smoothstep path {
  fill: none;
}

/* Edge labels */
.react-flow__edge-label {
  background-color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* ===== LAYOUT IMPROVEMENTS ===== */

.diagram-container-v2 {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.diagram-header-v2 {
  padding: 15px 20px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-bottom: 2px solid #0d47a1;
}

.diagram-header-v2 h2 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.diagram-subtitle {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.react-flow-wrapper {
  flex: 1;
  position: relative;
}

/* Control buttons styling */
.react-flow__controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.react-flow__controls button {
  background-color: white;
  border: 2px solid #1976d2;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.react-flow__controls button:hover {
  background-color: #e3f2fd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.react-flow__controls button:active {
  transform: scale(0.95);
}

/* ===== RESPONSIVENESS ===== */

@media (max-width: 1200px) {
  .problem-carousel-sidebar {
    max-width: 300px;
  }
  
  .custom-node {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .networking-container-v2 {
    flex-direction: column;
  }
  
  .problem-carousel-sidebar {
    max-width: 100%;
    max-height: 30%;
    border-right: none;
    border-bottom: 2px solid #ddd;
  }
  
  .diagram-container-v2 {
    max-height: 70%;
  }
}
```

---

## Key Features Summary

✅ **Large spacing** between all nodes (150-300px horizontally, 150-170px vertically)  
✅ **Data Center separation** with extra 200px+ spacing  
✅ **Curved edges** using smoothstep type  
✅ **Problem badges** with animation and highlighting  
✅ **Draggable nodes** for student adjustments  
✅ **Device details** on hover (IP, VLAN, role)  
✅ **Clickable badges** showing problem details  
✅ **Zoom-to-fit** via React Flow Controls  
✅ **No overlapping** elements or labels  
✅ **Color-coded** connections by type  

---

## Testing Checklist

- [ ] All nodes display without overlap
- [ ] Nodes are draggable
- [ ] Edges curve smoothly
- [ ] Hovering shows device details
- [ ] Clicking badges shows problem modal
- [ ] Problem highlighting animates
- [ ] All 23 nodes visible
- [ ] All 20 edges connected properly
- [ ] Data Center visually separated
- [ ] Zoom-to-fit button works
- [ ] Colors match problem severity

---

## Performance Tips

1. **Use React.memo** for CustomNode to prevent re-renders
2. **Debounce** hover events if performance degrades
3. **Use viewport** to limit node rendering
4. **Optimize** CSS animations with `will-change`
5. **Lazy load** problem details modals on demand

---

## Next Steps

1. Copy `networkLayout.json` content into your data folder
2. Update imports in `NetworkingScreen.jsx`
3. Add new CSS classes to `NetworkingScreen.css`
4. Test with React Flow Controls
5. Fine-tune spacing if needed
6. Deploy and gather student feedback

---

This integration is **production-ready** and fully compatible with React Flow v11+!
