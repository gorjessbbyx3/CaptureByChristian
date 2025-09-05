import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plug2 as Plug, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Zap,
  DollarSign,
  FileText,
  Users,
  RefreshCw,
  Shield
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  isConnected: boolean;
  isActive: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  config?: any;
}

const availableIntegrations: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Sync invoices, customers, and payments with QuickBooks Online for seamless accounting.',
    icon: DollarSign,
    category: 'Accounting',
    isConnected: false,
    isActive: false,
    status: 'disconnected'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and automatically sync transaction data.',
    icon: Zap,
    category: 'Payments',
    isConnected: false,
    isActive: false,
    status: 'disconnected'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync booking appointments with your Google Calendar.',
    icon: FileText,
    category: 'Calendar',
    isConnected: false,
    isActive: false,
    status: 'disconnected'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Automatically add clients to your email marketing campaigns.',
    icon: Users,
    category: 'Marketing',
    isConnected: false,
    isActive: false,
    status: 'disconnected'
  }
];

export function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [qbCredentials, setQbCredentials] = useState({
    clientId: '',
    clientSecret: '',
    sandboxMode: true
  });

  // Fetch integration status from backend
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const response = await fetch('/api/integrations');
      if (!response.ok) return availableIntegrations;
      const data = await response.json();
      // Merge with available integrations
      return availableIntegrations.map(integration => {
        const existing = data.find((i: any) => i.id === integration.id);
        return existing ? { ...integration, ...existing } : integration;
      });
    }
  });

  // Connect QuickBooks mutation
  const connectQuickBooksMutation = useMutation({
    mutationFn: async (credentials: any) => {
      return await apiRequest("POST", "/api/integrations/quickbooks/connect", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: "QuickBooks Connected",
        description: "Successfully connected to QuickBooks Online",
      });
      setSelectedIntegration(null);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to QuickBooks",
        variant: "destructive",
      });
    }
  });

  // Sync QuickBooks data mutation
  const syncQuickBooksMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/integrations/quickbooks/sync");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: "Sync Complete",
        description: "QuickBooks data has been synchronized",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync QuickBooks data",
        variant: "destructive",
      });
    }
  });

  // Toggle integration status
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/integrations/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    }
  });

  const handleConnectQuickBooks = () => {
    if (!qbCredentials.clientId || !qbCredentials.clientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please provide both Client ID and Client Secret",
        variant: "destructive",
      });
      return;
    }
    connectQuickBooksMutation.mutate(qbCredentials);
  };

  const handleQuickBooksOAuth = () => {
    // Redirect to QuickBooks OAuth
    const clientId = qbCredentials.clientId;
    const redirectUri = `${window.location.origin}/admin/integrations/quickbooks/callback`;
    const scope = 'com.intuit.quickbooks.accounting';
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
      `client_id=${clientId}&` +
      `scope=${scope}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${state}`;
    
    // Store state in session storage for validation
    sessionStorage.setItem('qb_oauth_state', state);
    sessionStorage.setItem('qb_client_credentials', JSON.stringify(qbCredentials));
    
    window.location.href = authUrl;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'error': return AlertCircle;
      default: return Plug;
    }
  };

  const renderQuickBooksSetup = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">QuickBooks Online Setup</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Integration</h4>
              <p className="text-sm text-blue-700 mt-1">
                We use OAuth 2.0 for secure authentication. Your QuickBooks credentials are never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="qb-client-id">QuickBooks Client ID</Label>
          <Input
            id="qb-client-id"
            type="text"
            placeholder="Enter your QuickBooks App Client ID"
            value={qbCredentials.clientId}
            onChange={(e) => setQbCredentials(prev => ({ ...prev, clientId: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this from your QuickBooks Developer account
          </p>
        </div>

        <div>
          <Label htmlFor="qb-client-secret">QuickBooks Client Secret</Label>
          <Input
            id="qb-client-secret"
            type="password"
            placeholder="Enter your QuickBooks App Client Secret"
            value={qbCredentials.clientSecret}
            onChange={(e) => setQbCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sandbox-mode"
            checked={qbCredentials.sandboxMode}
            onCheckedChange={(checked) => setQbCredentials(prev => ({ ...prev, sandboxMode: checked }))}
          />
          <Label htmlFor="sandbox-mode">Sandbox Mode (for testing)</Label>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleQuickBooksOAuth} className="btn-bronze">
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect with OAuth
        </Button>
        <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
          Cancel
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">Need help setting up QuickBooks?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a developer account at <a href="https://developer.intuit.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">developer.intuit.com</a></li>
          <li>Create a new app and get your Client ID and Secret</li>
          <li>Add this redirect URI: <code className="bg-gray-100 px-1 rounded">{window.location.origin}/admin/integrations/quickbooks/callback</code></li>
          <li>Use sandbox mode for testing, then switch to production</li>
        </ol>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your business tools to streamline your workflow and automate data sync.
        </p>
      </div>

      {selectedIntegration ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <selectedIntegration.icon className="h-6 w-6 mr-2" />
              {selectedIntegration.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIntegration.id === 'quickbooks' ? renderQuickBooksSetup() : (
              <div>
                <p>Integration setup for {selectedIntegration.name} will be available soon.</p>
                <Button variant="outline" onClick={() => setSelectedIntegration(null)} className="mt-4">
                  Back to Integrations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(integrations || availableIntegrations).map((integration) => {
            const StatusIcon = getStatusIcon(integration.status);
            
            return (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <integration.icon className="h-8 w-8 text-bronze" />
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(integration.status)}`} />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  {integration.isConnected && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active</span>
                        <Switch
                          checked={integration.isActive}
                          onCheckedChange={(checked) => 
                            toggleIntegrationMutation.mutate({ 
                              id: integration.id, 
                              isActive: checked 
                            })
                          }
                        />
                      </div>
                      
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {integration.isConnected ? (
                      <>
                        {integration.id === 'quickbooks' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncQuickBooksMutation.mutate()}
                            disabled={syncQuickBooksMutation.isPending}
                          >
                            {syncQuickBooksMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Sync Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="btn-bronze"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Plug className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}