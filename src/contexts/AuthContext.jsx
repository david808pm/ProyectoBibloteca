import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeTestData } from "../lib/testData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario del localStorage al montar
  useEffect(() => {
    // Inicializar datos de prueba
    initializeTestData();
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error("Correo o contraseña incorrectos");
    }

    const userData = {
      id: foundUser.id,
      nombre: foundUser.nombre,
      email: foundUser.email,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Verificar si está autenticado
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
