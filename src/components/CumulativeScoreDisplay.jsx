import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";

/**
 * Cumulative Score Display Component
 * 
 * Behavior:
 * - Hidden on all routes except /debug
 * - On /debug: Shows total cumulative score with breakdown
 * - Score accumulates silently during gameplay (/task1, /networking, /missionnetworking, /caesar)
 * - Full score display only visible when reaching /debug
 */
export default function CumulativeScoreDisplay() {
  const { user } = useUser();
  const location = useLocation();
  const isDebugPage = location.pathname === "/debug";

  // Don't render score display anywhere except /debug
  if (!isDebugPage) {
    return null;
  }

  // Calculate components of total score
  const phaseScores = [
    { label: "Task 1 (Component Collection)", value: user?.task1Score || 0 },
    { label: "Networking (Puzzle)", value: user?.networkingScore || 0 },
    { label: "Mission Networking (Letter Collection)", value: user?.missionNetworkingScore || 0 },
    { label: "Caesar (Cipher)", value: user?.caesarScore || 0 },
    { label: "Debug (Code Blocks)", value: user?.debugScore || 0 },
  ];

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "rgba(0, 255, 255, 0.1)",
      border: "2px solid #00ffff",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "350px",
      fontFamily: "monospace",
      color: "#00ffff",
      zIndex: 9999,
      backdropFilter: "blur(5px)",
      boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
    }}>
      <h3 style={{
        margin: "0 0 15px 0",
        fontSize: "1.2em",
        color: "#00ff00",
        textAlign: "center",
      }}>
        🎮 CUMULATIVE SCORE
      </h3>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        fontSize: "0.9em",
        marginBottom: "15px",
        paddingBottom: "15px",
        borderBottom: "1px solid #00ffff",
      }}>
        {phaseScores.map((phase, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>{phase.label}</span>
            <span style={{
              backgroundColor: phase.value > 0 ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)",
              padding: "4px 8px",
              borderRadius: "4px",
              minWidth: "60px",
              textAlign: "right",
              color: phase.value > 0 ? "#00ff00" : "#ff6666",
              fontWeight: "bold",
            }}>
              {phase.value} pts
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "1.1em",
        fontWeight: "bold",
        color: "#ffff00",
      }}>
        <span>TOTAL</span>
        <span style={{
          backgroundColor: "rgba(255, 255, 0, 0.2)",
          padding: "6px 12px",
          borderRadius: "6px",
          minWidth: "70px",
          textAlign: "right",
        }}>
          {user?.totalScore || 0} pts
        </span>
      </div>

      <div style={{
        marginTop: "12px",
        fontSize: "0.8em",
        color: "#aabbff",
        textAlign: "center",
        borderTop: "1px solid #00ffff",
        paddingTop: "12px",
      }}>
        <p style={{ margin: "0 0 5px 0" }}>
          Max Possible: 3,750 pts
        </p>
        <p style={{ margin: "0" }}>
          Accuracy: {user?.totalScore ? Math.round((user.totalScore / 3750) * 100) : 0}%
        </p>
      </div>
    </div>
  );
}
