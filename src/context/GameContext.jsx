import { createContext, useState } from "react";

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [progress, setProgress] = useState({
    task1Complete: false,
    task2Complete: false,
    task3Complete: false,
    keyword: "",
  });

  function completeTask(taskNumber) {
    setProgress((prev) => ({
      ...prev,
      [`task${taskNumber}Complete`]: true,
    }));
  }

  return (
    <GameContext.Provider value={{ progress, completeTask }}>
      {children}
    </GameContext.Provider>
  );
}
