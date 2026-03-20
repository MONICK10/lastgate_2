import { useState } from "react";
import { validateTask1 } from "../lib/puzzles";

export default function NetworkPuzzle({ onSuccess }) {
  // Player-selected path
  const [path, setPath] = useState([]);

  // Available nodes (simple MVP)
  const nodes = ["A", "B", "C", "D", "E", "F"];

  function handleNodeClick(node) {
    // Prevent duplicate clicks
    if (path.includes(node)) return;

    setPath([...path, node]);
  }

  function handleReset() {
    setPath([]);
  }

  function handleSubmit() {
    const isCorrect = validateTask1(path);

    if (isCorrect) {
      alert("✅ Link Restored! Gate Access Key Unlocked.");
      onSuccess(); // Move to Task2
    } else {
      alert("❌ Signal Failed. Wrong network path.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Restore the Broken Network Path</h2>

      <p>
        Click nodes in the correct order to rebuild the communication link.
      </p>

      {/* Nodes */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        {nodes.map((node) => (
          <button
            key={node}
            onClick={() => handleNodeClick(node)}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {node}
          </button>
        ))}
      </div>

      {/* Current Path */}
      <h3>Selected Path:</h3>
      <p style={{ fontWeight: "bold" }}>
        {path.length > 0 ? path.join(" → ") : "No nodes selected"}
      </p>

      {/* Controls */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} style={{ marginRight: "10px" }}>
          Submit Path
        </button>

        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}
