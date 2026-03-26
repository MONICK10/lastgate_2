import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";

export default function Complete() {
  const { user, clearUser } = useUser();
  const [isClearing, setIsClearing] = useState(false);
  
  // Capture score immediately, then clear data after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClearing(true);
      clearUser();
      // Force localStorage clear to ensure it's gone
      localStorage.removeItem("userDetails");
      sessionStorage.clear(); // Also clear any session data
    }, 5000); // Show score for 5 seconds, then reset
    
    return () => clearTimeout(timer);
  }, [clearUser]);
  
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
        maxWidth: "400px"
      }}>
        <h2 style={{ color: "#00ff00", fontSize: "2em", marginBottom: "20px" }}>✨ Final Results ✨</h2>
        
        {isClearing ? (
          <div style={{ fontSize: "1.3em", color: "#ffff00", animation: "blink 0.5s infinite" }}>
            <p>🔄 Resetting for next player...</p>
            <p>Data cleared ✓</p>
          </div>
        ) : (
          <div style={{ fontSize: "1.3em", marginBottom: "15px", color: "#ffffff" }}>
            <p><strong>{user?.name || "Player"}</strong> has completed the game with <strong>{user?.totalScore || 0}</strong> points in <strong>{user?.totalTime || 0}</strong> seconds</p>
          </div>
        )}
        
        {!isClearing && (
          <div style={{ 
            fontSize: "0.9em", 
            color: "#aabbff", 
            marginTop: "30px", 
            borderTop: "2px solid #00ffff",
            paddingTop: "20px"
          }}>
            <p>Register: {user?.registerNumber || "N/A"}</p>
            <p>Networking: {user?.networkingScore || 0} pts</p>
            <p>Task 1: {user?.task1Score || 0} pts</p>
            <p>Task 2: {user?.task2Score || 0} pts</p>
            <p>Caesar: {user?.caesarScore || 0} pts</p>
            <p>Debug: {user?.debugScore || 0} pts</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
