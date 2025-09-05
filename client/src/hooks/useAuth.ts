import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loginTime: string | null;
  token: string | null;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  error?: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state synchronously from localStorage
    const token = localStorage.getItem("auth_token");
    const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
    const username = localStorage.getItem("admin_username");
    const loginTime = localStorage.getItem("admin_login_time");
    
    // Check session validity immediately
    if (isAuthenticated && loginTime) {
      const loginTimestamp = new Date(loginTime).getTime();
      const currentTime = new Date().getTime();
      const sessionDuration = 24 * 60 * 60 * 1000;
      
      if (currentTime - loginTimestamp > sessionDuration) {
        // Session expired
        return {
          isAuthenticated: false,
          username: null,
          loginTime: null,
          token: null,
        };
      }
    }
    
    return {
      isAuthenticated,
      username,
      loginTime,
      token,
    };
  });
  const [_location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";
      const username = localStorage.getItem("admin_username");
      const loginTime = localStorage.getItem("admin_login_time");

      // Check if session is still valid (24 hours)
      if (isAuthenticated && loginTime) {
        const loginTimestamp = new Date(loginTime).getTime();
        const currentTime = new Date().getTime();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (currentTime - loginTimestamp > sessionDuration) {
          // Session expired, logout
          logout();
          return;
        }
      }

      setAuthState({
        isAuthenticated,
        username,
        loginTime,
        token,
      });
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Login with JWT token
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        // Store authentication data
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_username", data.user.username);
        localStorage.setItem("admin_login_time", new Date().toISOString());
        localStorage.setItem("auth_token", data.token);

        setAuthState({
          isAuthenticated: true,
          username: data.user.username,
          loginTime: new Date().toISOString(),
          token: data.token,
        });

        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_login_time");
    localStorage.removeItem("auth_token");
    
    setAuthState({
      isAuthenticated: false,
      username: null,
      loginTime: null,
      token: null,
    });
    setLocation("/admin-login");
  };

  const requireAuth = () => {
    if (!authState.isAuthenticated) {
      setLocation("/admin-login");
      return false;
    }
    return true;
  };

  return {
    ...authState,
    login,
    logout,
    requireAuth,
  };
}