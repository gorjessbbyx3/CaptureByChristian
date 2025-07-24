import React, { useState, useEffect } from "react";
import { ClientLogin } from "@/components/client-portal/client-login";
import { ClientDashboard } from "@/components/client-portal/client-dashboard";
import { GalleryViewer } from "@/components/client-portal/gallery-viewer";
import { apiRequest } from "@/lib/queryClient";

export function ClientPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'gallery'>('dashboard');
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedClientData = localStorage.getItem('clientPortalData');
    if (storedClientData) {
      try {
        const data = JSON.parse(storedClientData);
        setClientData(data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('clientPortalData');
      }
    }

    // Handle magic link authentication
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      handleMagicLinkAuth(token);
    }
  }, []);

  const handleMagicLinkAuth = async (token: string) => {
    try {
      const response = await apiRequest('POST', '/api/client-portal/verify-magic-link', { token });

      const data = await response.json();
      handleLoginSuccess(data);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Magic link authentication failed:', error);
    }
  };

  const handleLoginSuccess = (data: any) => {
    setClientData(data);
    setIsAuthenticated(true);
    localStorage.setItem('clientPortalData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    setCurrentView('dashboard');
    setSelectedGalleryId(null);
    localStorage.removeItem('clientPortalData');
  };

  const handleViewGallery = (galleryId: string) => {
    setSelectedGalleryId(galleryId);
    setCurrentView('gallery');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedGalleryId(null);
  };

  if (!isAuthenticated) {
    return <ClientLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'gallery' && selectedGalleryId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="text-bronze hover:text-bronze/80 flex items-center space-x-2"
            >
              <span>← Back to Dashboard</span>
            </button>
          </div>
          <GalleryViewer 
            galleryId={selectedGalleryId} 
            clientId={clientData.id}
          />
        </div>
      </div>
    );
  }

  return (
    <ClientDashboard 
      clientData={clientData} 
      onLogout={handleLogout}
      onViewGallery={handleViewGallery}
    />
  );
}