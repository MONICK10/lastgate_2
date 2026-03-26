import { useUser } from "../context/UserContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Complete() {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  
  // Only clear localStorage on initial load to prevent stale data on next session
  useEffect(() => {
    // Clear localStorage to ensure fresh start for next player on page reload
    localStorage.removeItem("userDetails");
    sessionStorage.clear();
  }, []);

  const handlePlayAgain = () => {
    clearUser();
    localStorage.removeItem("userDetails");
    navigate("/");
  };
  
  return (
    <div style={{ 
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #000 0%, #1a0033 100%)",
      fontFamily: "monospace",
      padding: "20px",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "4em", marginBottom: "40px", color: "#00ffff" }}>🏆 Mission Complete</h1>
      <p style={{ fontSize: "1.5em", marginBottom: "30px", color: "#ffff00" }}>Vecna is destroyed. Hawkins is saved.</p>
      
      <div style={{
        marginTop: "60px",
        padding: "40px",
        border: "3px solid #00ffff",
        borderRadius: "10px",
        background: "rgba(0, 255, 255, 0.1)",
        maxWidth: "500px"
      }}>
        <h2 style={{ color: "#00ff00", fontSize: "2em", marginBottom: "20px" }}>✨ Final Results ✨</h2>
        
        <div style={{ fontSize: "1.3em", marginBottom: "15px", color: "#ffffff" }}>
          <p><strong>{user?.name || "Player"}</strong> has completed the game!</p>
          <p style={{ fontSize: "2.5em", color: "#ffdc00", marginTop: "15px", textShadow: "0 0 20px #ffdc00" }}>
            {user?.totalScore || 0}
          </p>
          <p style={{ fontSize: "1em", color: "#aabbff" }}>Total Score</p>
        </div>
        
        <div style={{ 
          fontSize: "0.95em", 
          color: "#aabbff", 
          marginTop: "30px", 
          borderTop: "2px solid #00ffff",
          paddingTop: "20px"
        }}>
          <p><strong>Player Details:</strong></p>
          <p>Name: {user?.name || "N/A"}</p>
          <p>Register: {user?.registerNumber || "N/A"}</p>
          <p>Time: {user?.totalTime || 0}s</p>
          
          <div style={{ marginTop: "20px", borderTop: "1px solid #00ffff77", paddingTop: "15px" }}>
            <p><strong>Score Breakdown:</strong></p>
            <p>Task 1: {user?.task1Score || 0} pts</p>
            <p>Networking: {user?.networkingScore || 0} pts</p>
            <p>Mission Networking: {user?.missionNetworkingScore || 0} pts</p>
            <p>Caesar: {user?.caesarScore || 0} pts</p>
            <p>Debug: {user?.debugScore || 0} pts</p>
          </div>
        </div>

        <button 
          onClick={handlePlayAgain}
          style={{
            marginTop: "30px",
            padding: "12px 30px",
            fontSize: "1em",
            backgroundColor: "#00ff00",
            color: "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 15px #00ff00",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 0 30px #00ff00";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 0 15px #00ff00";
            e.target.style.transform = "scale(1)";
          }}
        >
          🔄 Play Again
        </button>
      </div>

      <p style={{ marginTop: "40px", fontSize: "0.9em", color: "#00ffff77" }}>
        Refresh page or click "Play Again" to reset for next player
      </p>
    </div>
  );
}
