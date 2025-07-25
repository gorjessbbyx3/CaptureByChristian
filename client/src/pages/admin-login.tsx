import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Clear any existing auth data when login page loads
  useState(() => {
    console.log("🧹 Clearing existing auth data on login page load");
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_login_time");
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("🔐 Login attempt started");
    console.log("📝 Username:", username);
    console.log("🔑 Password length:", password.length);
    console.log("🧹 Username trimmed:", `"${username.trim()}"`);
    console.log("🧹 Password trimmed:", `"${password.trim()}"`);

    try {
      // Check credentials (case-sensitive)
      const isValidUsername = username.trim() === "CapturedbyChristian";
      const isValidPassword = password.trim() === "Wordpass3211";
      
      console.log("✅ Username valid:", isValidUsername);
      console.log("✅ Password valid:", isValidPassword);
      
      if (isValidUsername && isValidPassword) {
        console.log("🎉 Credentials valid, storing auth data...");
        
        // Clear any existing auth data first
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_login_time");
        
        console.log("🧹 Cleared old auth data");
        
        // Store authentication in localStorage
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_username", username.trim());
        localStorage.setItem("admin_login_time", new Date().toISOString());
        
        console.log("💾 Auth data stored");
        console.log("📄 localStorage admin_authenticated:", localStorage.getItem("admin_authenticated"));
        console.log("👤 localStorage admin_username:", localStorage.getItem("admin_username"));
        console.log("⏰ localStorage admin_login_time:", localStorage.getItem("admin_login_time"));
        
        // Immediate redirect - no delay
        console.log("🚀 Redirecting to /admin");
        setLocation("/admin");
      } else {
        console.log("❌ Invalid credentials provided");
        console.log("Expected username: 'CapturedbyChristian'");
        console.log("Expected password: 'Wordpass3211'");
        setError("Invalid username or password. Please check your credentials and try again.");
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full w-16 h-16 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Admin Portal
            </CardTitle>
            <p className="text-slate-300 mt-2">
              CapturedCollective Dashboard Access
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-amber-400 focus:ring-amber-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/20 border-red-500/30 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-3 transition-all duration-200 shadow-lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                Secure access to CapturedCollective<br />
                photography business management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}