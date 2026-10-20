// src/context/UserContext.jsx

import { createContext, useEffect, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("course_app_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("course_app_token") || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Authenticated fetch helper that includes credentials and Bearer token
  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      const currentToken = token || localStorage.getItem("course_app_token");
      if (currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // If token expired or unauthorized
      if (response.status === 401 && !url.includes("/auth/login")) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("course_app_user");
        localStorage.removeItem("course_app_token");
      }

      return response;
    },
    [token],
  );

  // Verify auth on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const currentToken = localStorage.getItem("course_app_token");
      if (!currentToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
            localStorage.setItem("course_app_user", JSON.stringify(data.user));
          }
        } else {
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("course_app_user");
            localStorage.removeItem("course_app_token");
          }
        }
      } catch (err) {
        console.warn("Auth check failed:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Login failed");
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("course_app_user", JSON.stringify(data.user));
    localStorage.setItem("course_app_token", data.token);

    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("course_app_user");
      localStorage.removeItem("course_app_token");
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    authFetch,
    API_BASE,
    isAuthenticated: !!user,
    isTeacher: user?.role === "Teacher",
    isStudent: user?.role === "Student",
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
