"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { customFetch } from "../utils/customFetch";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      // Set default auth header for axios
      customFetch.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await customFetch.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;
      const userData = {
        id: data.id,
        name: data.username,
        email: data.email,
        avatar: null,
        color: "#8B5CF6",
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      // Set default auth header for future requests
      customFetch.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await customFetch.post("/auth/register", {
        username,
        email,
        password,
      });

      const data = response.data;
      const userData = {
        id: data.id,
        name: data.username,
        email: data.email,
        avatar: null,
        color: "#8B5CF6",
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      // Set default auth header for future requests
      customFetch.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
    // Remove auth header
    delete customFetch.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
