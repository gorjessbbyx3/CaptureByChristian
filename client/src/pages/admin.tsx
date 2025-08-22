import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminCalendar } from "@/components/admin/calendar";
import { ClientManagement } from "@/components/admin/client-management";
import { PortfolioManagement } from "@/components/admin/portfolio-management";
import { LeadManagement } from "@/components/admin/lead-management";
import { AdvancedAnalytics } from "@/components/admin/advanced-analytics";
import { AIBusinessInsights } from "@/components/admin/ai-business-insights";
import { RealTimeAnalytics } from "@/components/admin/real-time-analytics";
import { AdvancedAIChat } from "@/components/admin/advanced-ai-chat";
import { PredictiveIntelligence } from "@/components/admin/predictive-intelligence";
import { InvoiceGenerator } from "@/components/admin/invoice-generator";
import { ContractManagement } from "@/components/admin/contract-management";
import { AdminInbox } from "@/components/admin/inbox";
import { ClientCredentials } from "@/components/admin/client-credentials";
import { ProfileManagement } from "@/components/admin/profile-management";
import { ClientPortal } from "@/components/admin/client-portal";
import { ServiceManagement } from "@/components/admin/service-management";
import PropertyResearch from "@/components/admin/property-research";
import { Button } from "@/components/ui/button";
// Card components removed - not used in current implementation
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Camera,
  FileText,
  BarChart3,
  Settings,
  // Upload,
  Brain,
  Mail,
  // Home,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  TrendingUp,
  Zap,
  LogOut,
  Key,
  Search,
} from "lucide-react";
import ErrorBoundary from "@/components/error-boundary";

const menuSections = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "real-time", label: "Real-Time Analytics", icon: Activity },
      { id: "analytics", label: "Advanced Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "AI Intelligence",
    items: [
      { id: "ai-insights", label: "Business Insights", icon: Brain },
      { id: "ai-chat", label: "AI Assistant", icon: Brain },
      { id: "predictive", label: "Predictive Analysis", icon: Target },
    ],
  },
  {
    title: "Business Operations",
    items: [
      { id: "calendar", label: "Calendar", icon: Calendar },
      { id: "clients", label: "Client Management", icon: Users },
      { id: "leads", label: "Lead Management", icon: TrendingUp },
      { id: "services", label: "Service Management", icon: Settings },
      { id: "inbox", label: "Messages", icon: Mail },
      { id: "contracts", label: "Contracts", icon: FileText },
      { id: "invoices", label: "Invoices", icon: FileText },
      { id: "property-research", label: "Property Research", icon: Search },
    ],
  },
  {
    title: "Content & Portfolio",
    items: [
      { id: "gallery", label: "Portfolio Management", icon: Camera },
      { id: "portal", label: "Client Portal", icon: Settings },
      { id: "credentials", label: "Client Credentials", icon: Key },
    ],
  },
  {
    title: "Settings & Configuration",
    items: [{ id: "profile", label: "Profile", icon: Settings }],
  },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, username, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to ensure localStorage is read properly
      await new Promise((resolve) => setTimeout(resolve, 100));

      const authStatus = localStorage.getItem("admin_authenticated") === "true";

      if (!authStatus) {
        console.log("Not authenticated, redirecting to login");
        setLocation("/admin-login");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism backdrop-blur-md border-b border-white/20 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 hover-lift cursor-pointer">
                <div className="p-2 bg-gradient-to-r from-bronze to-teal rounded-full">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <span className="font-playfair text-xl font-bold gradient-text">
                  CapturedCollective
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <span className="text-foreground hover:text-bronze transition-colors duration-200 cursor-pointer">
                  Home
                </span>
              </Link>
              <a
                href="/#portfolio"
                className="text-foreground hover:text-bronze transition-colors duration-200"
              >
                Portfolio
              </a>
              <a
                href="/#services"
                className="text-foreground hover:text-bronze transition-colors duration-200"
              >
                Services
              </a>
              <a
                href="/#about"
                className="text-foreground hover:text-bronze transition-colors duration-200"
              >
                About
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="mr-2"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2 text-sm text-foreground/80">
                <span>Welcome, {username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-400/30"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>

              <Link href="/client-portal">
                <Button variant="outline" size="sm">
                  Client Portal
                </Button>
              </Link>

              <Link href="/book">
                <Button className="bg-gradient-to-r from-bronze to-teal hover:from-bronze/90 hover:to-teal/90">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Layout with Sidebar */}
      <ErrorBoundary>
        <div className="flex pt-16">
          {/* Sidebar */}
          <div
            className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-card border-r border-border transition-all duration-300 flex flex-col min-h-screen`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-bronze to-teal rounded-full">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-playfair text-lg font-bold gradient-text">
                      Admin Panel
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Navigation Menu */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    {!sidebarCollapsed && (
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full justify-start h-10 ${
                            activeTab === item.id
                              ? "bg-bronze text-white hover:bg-bronze/90"
                              : "hover:bg-muted"
                          } ${sidebarCollapsed ? "px-2" : "px-3"}`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <item.icon
                            className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`}
                          />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                    {!sidebarCollapsed && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <Badge
                variant="outline"
                className="w-full justify-center text-xs"
              >
                Admin Dashboard
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <div className="bg-card border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-playfair text-2xl font-bold">
                    {menuSections
                      .flatMap((s) => s.items)
                      .find((item) => item.id === activeTab)?.label ||
                      "Dashboard"}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your photography business with AI-powered tools
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-sm">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Updates
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "ai-insights":
        return <AIBusinessInsights />;
      case "ai-chat":
        return <AdvancedAIChat />;
      case "predictive":
        return <PredictiveIntelligence />;
      case "real-time":
        return <RealTimeAnalytics />;
      case "calendar":
        return <AdminCalendar />;
      case "clients":
        return <ClientManagement />;
      case "leads":
        return <LeadManagement />;
      case "services":
        return <ServiceManagement />;
      case "gallery":
        return <PortfolioManagement />;
      case "inbox":
        return <AdminInbox />;
      case "contracts":
        return <ContractManagement />;
      case "invoices":
        return <InvoiceGenerator />;
      case "analytics":
        return <AdvancedAnalytics />;
      case "portal-management":
        return <ClientPortal />;
      case "portal":
        return <ClientPortal />;
      case "credentials":
        return <ClientCredentials />;
      case "profile":
        return <ProfileManagement />;
      case "property-research":
        return <PropertyResearch />;
      default:
        return <AdminDashboard />;
    }
  }
}
