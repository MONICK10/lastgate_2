import { createContext, useState, useContext, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "",
    registerNumber: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("userDetails");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user details:", error);
      }
    }
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem("userDetails", JSON.stringify(user));
  }, [user]);

  const updateUser = (name, registerNumber) => {
    setUser({
      name: name || "",
      registerNumber: registerNumber || "",
    });
  };

  const clearUser = () => {
    setUser({
      name: "",
      registerNumber: "",
    });
    localStorage.removeItem("userDetails");
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
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
