import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plug2 as Plug,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  Users,
  RefreshCw
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

  // Toggle integration status
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/integrations/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to toggle integration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    }
  });

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
            <div>
              <p>Integration setup for {selectedIntegration.name} will be available soon.</p>
              <Button variant="outline" onClick={() => setSelectedIntegration(null)} className="mt-4">
                Back to Integrations
              </Button>
            </div>
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
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
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
