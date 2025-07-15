import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loginTime: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    loginTime: null,
  });
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
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
      });
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_login_time");
    setAuthState({
      isAuthenticated: false,
      username: null,
      loginTime: null,
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
    logout,
    requireAuth,
  };
}