import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");

    if (token && user) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(user),
          token
        };
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        return {
          isAuthenticated: false,
          user: null,
          token: null
        };
      }
    }

    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  });
  const [_location, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      const user = localStorage.getItem("admin_user");

      if (token && user) {
        try {
          setAuthState({
            isAuthenticated: true,
            user: JSON.parse(user),
            token
          });
        } catch (error) {
          // Clear invalid data if parsing fails
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null
          });
        }
      } else {
        // No token or user found, ensure state reflects logged out status
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null
        });
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', checkAuth);
    // Initial check in case the component mounts after storage has been updated
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Login with JWT token and user data
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
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));

        setAuthState({
          isAuthenticated: true,
          user: data.user,
          token: data.token,
        });

        return { success: true };
      } else {
        // Clear any potentially stale data on failed login
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      // Clear any potentially stale data on network error
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      return { success: false, error: "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    // Remove old keys if they exist, for backward compatibility
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_login_time");

    setAuthState({
      isAuthenticated: false,
      user: null,
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