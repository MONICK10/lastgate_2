import { createContext, useState, useContext, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "",
    registerNumber: "",
    task1Score: 0,
    networkingScore: 0,
    missionNetworkingScore: 0,
    caesarScore: 0,
    debugScore: 0,
    totalScore: 0,
    totalTime: 0,
    gameCompleted: false,
    currentPhase: "home", // Track current phase: home, task1, networking, missionnetworking, caesar, debug
    modulesCompleted: {
      task1: false,
      networking: false,
      missionnetworking: false,
      caesar: false,
      debug: false,
    },
  });

  // Load from localStorage on mount - ensures data persists through page reloads during gameplay
  useEffect(() => {
    const savedUser = localStorage.getItem("userDetails");
    // Only load if data exists and is not null AND user has started the game
    if (savedUser && savedUser !== "null") {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Only load if user has a name (meaning they entered the form)
        // This prevents stale data from previous sessions showing up on fresh app start
        if (parsedUser.name && parsedUser.name.trim() !== "") {
          setUser(parsedUser);
        } else {
          // If no name, clear the stale data
          localStorage.removeItem("userDetails");
        }
      } catch (error) {
        console.error("Failed to parse saved user details:", error);
        localStorage.removeItem("userDetails");
      }
    } else {
      // Ensure fresh start - clear any remnants
      localStorage.removeItem("userDetails");
    }
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem("userDetails", JSON.stringify(user));
  }, [user]);

  const updateUser = (name, registerNumber) => {
    setUser((prev) => ({
      ...prev,
      name: name || prev.name,
      registerNumber: registerNumber || prev.registerNumber,
    }));
  };

  /**
   * Add score to a specific phase and recalculate total
   * @param {string} phase - Phase name (task1, networking, missionnetworking, caesar, debug)
   * @param {number} points - Points to add to this phase
   */
  const addPhaseScore = (phase, points) => {
    setUser((prev) => {
      const newUser = { ...prev };
      
      // Map phase name to score field
      const scoreField = `${phase}Score`;
      newUser[scoreField] = points;
      
      // Recalculate total score by summing all phases
      newUser.totalScore = 
        (newUser.task1Score || 0) +
        (newUser.networkingScore || 0) +
        (newUser.missionNetworkingScore || 0) +
        (newUser.caesarScore || 0) +
        (newUser.debugScore || 0);
      
      console.log(`✓ Phase "${phase}" scored ${points} pts | Total: ${newUser.totalScore}`);
      return newUser;
    });
  };

  /**
   * Legacy updateScores for backward compatibility
   * Maintains old behavior while properly accumulating scores
   */
  const updateScores = (networkingScore = 0, debugScore = 0, caesarScore = 0, totalScore = 0, task1Score = 0, missionNetworkingScore = 0) => {
    setUser((prev) => {
      // If totalScore is provided, use it; otherwise recalculate from components
      const calculatedTotal = totalScore !== 0 ? totalScore : 
        (task1Score || prev.task1Score || 0) +
        (networkingScore || prev.networkingScore || 0) +
        (missionNetworkingScore || prev.missionNetworkingScore || 0) +
        (caesarScore || prev.caesarScore || 0) +
        (debugScore || prev.debugScore || 0);

      return {
        ...prev,
        task1Score: task1Score || prev.task1Score,
        networkingScore: networkingScore || prev.networkingScore,
        missionNetworkingScore: missionNetworkingScore || prev.missionNetworkingScore,
        caesarScore,
        debugScore,
        totalScore: calculatedTotal,
      };
    });
  };

  /**
   * Update current phase for tracking progress
   */
  const updatePhase = (phaseName) => {
    setUser((prev) => ({
      ...prev,
      currentPhase: phaseName,
    }));
  };

  /**
   * Mark a phase as complete
   */
  const markModuleComplete = (moduleName) => {
    setUser((prev) => ({
      ...prev,
      modulesCompleted: {
        ...prev.modulesCompleted,
        [moduleName]: true,
      },
    }));
  };

  /**
   * Complete the entire game with final time and score
   */
  const completeGame = (totalTime = 0, finalScore = 0) => {
    setUser((prev) => ({
      ...prev,
      totalTime,
      totalScore: finalScore || prev.totalScore,
      gameCompleted: true,
      currentPhase: "debug",
    }));
  };

  /**
   * Reset everything to initial state after game completion
   * This is called after the debug phase when showing final results
   */
  const clearUser = () => {
    setUser({
      name: "",
      registerNumber: "",
      task1Score: 0,
      networkingScore: 0,
      missionNetworkingScore: 0,
      caesarScore: 0,
      debugScore: 0,
      totalScore: 0,
      totalTime: 0,
      gameCompleted: false,
      currentPhase: "home",
      modulesCompleted: {
        task1: false,
        networking: false,
        missionnetworking: false,
        caesar: false,
        debug: false,
      },
    });
    localStorage.removeItem("userDetails");
    console.log("✓ User data cleared - fresh start ready");
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      updateScores,
      updatePhase,
      addPhaseScore,
      completeGame, 
      clearUser, 
      markModuleComplete 
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
