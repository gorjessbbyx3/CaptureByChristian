import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Key, 
  Mail, 
  Eye, 
  EyeOff, 
  Copy, 
  Send,
  Shield,
  Lock,
  User,
  RefreshCw,
  Settings,
  Bell
} from "lucide-react";

interface ClientCredential {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  hasPassword: boolean;
  passwordSet: boolean;
  lastLogin: string | null;
  magicLinkSent: boolean;
  portalAccess: boolean;
  createdAt: string;
}

export function ClientCredentials() {
  const [selectedClient, setSelectedClient] = useState<ClientCredential | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [loadingStates, setLoadingStates] = useState<{[key: number]: boolean}>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all clients with credential info
  const { data: clientCredentials = [], isLoading } = useQuery({
    queryKey: ['/api/client-credentials'],
    queryFn: async () => {
      const response = await fetch('/api/client-credentials');
      if (!response.ok) throw new Error('Failed to fetch client credentials');
      return response.json();
    }
  });

  // Generate password mutation
  const generatePasswordMutation = useMutation({
    mutationFn: async ({ clientId, password }: { clientId: number; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/client-credentials/set-password', { clientId, password });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Set",
        description: "Client portal password has been successfully set.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-credentials'] });
      setNewPassword("");
      setSelectedClient(null);
      setPasswordDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set client password.",
        variant: "destructive",
      });
    }
  });

  // Send magic link function with individual loading states
  const sendMagicLink = async (clientId: number) => {
    setLoadingStates(prev => ({ ...prev, [clientId]: true }));
    try {
      const response = await apiRequest('POST', '/api/admin/client-credentials/magic-link', { clientId });
      const result = await response.json();

      toast({
        title: "Magic Link Sent",
        description: result?.message || "Secure login link has been sent to the client's email.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-credentials'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [clientId]: false }));
    }
  };

  // Toggle portal access mutation
  const togglePortalAccessMutation = useMutation({
    mutationFn: async ({ clientId, enabled }: { clientId: number; enabled: boolean }) => {
      const response = await fetch('/api/admin/client-credentials/toggle-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, enabled }),
      });
      if (!response.ok) throw new Error('Failed to toggle portal access');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Portal Access Updated",
        description: "Client portal access has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/client-credentials'] });
    }
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Password copied to clipboard.",
    });
  };

  const getAccessStatus = (credential: ClientCredential) => {
    if (!credential.portalAccess) return { label: "Disabled", color: "bg-red-100 text-red-800" };
    if (credential.hasPassword) return { label: "Password Set", color: "bg-green-100 text-green-800" };
    if (credential.magicLinkSent) return { label: "Magic Link", color: "bg-blue-100 text-blue-800" };
    return { label: "Setup Required", color: "bg-yellow-100 text-yellow-800" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading client credentials...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Client Portal Credentials Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage client portal access credentials, passwords, and authentication methods.
          </p>
        </CardContent>
      </Card>

      {/* Credentials List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Access Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientCredentials.map((credential: ClientCredential) => {
              const status = getAccessStatus(credential);
              return (
                <div key={credential.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{credential.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{credential.clientEmail}</p>
                        {credential.lastLogin && (
                          <p className="text-xs text-muted-foreground">
                            Last login: {new Date(credential.lastLogin).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>

                      <div className="flex space-x-2">
                        {/* Set Password */}
                        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedClient(credential);
                                setPasswordDialogOpen(true);
                              }}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              {credential.hasPassword ? 'Reset' : 'Set'} Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Set Client Portal Password</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="client-info">Client</Label>
                                <div className="text-sm text-muted-foreground">
                                  {credential.clientName} ({credential.clientEmail})
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="flex space-x-2">
                                  <div className="relative flex-1">
                                    <Input
                                      id="password"
                                      type={showPassword ? "text" : "password"}
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="Enter new password"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateRandomPassword}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  {newPassword && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => copyToClipboard(newPassword)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setPasswordDialogOpen(false);
                                    setNewPassword("");
                                    setSelectedClient(null);
                                    setShowPassword(false);
                                  }}
                                  disabled={generatePasswordMutation.isPending}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => generatePasswordMutation.mutate({
                                    clientId: credential.clientId,
                                    password: newPassword
                                  })}
                                  disabled={!newPassword || generatePasswordMutation.isPending}
                                  className="flex-1"
                                >
                                  {generatePasswordMutation.isPending ? 'Setting...' : 'Set Password'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Send Magic Link */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendMagicLink(credential.clientId)}
                          disabled={loadingStates[credential.clientId] || false}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {loadingStates[credential.clientId] ? 'Sending...' : 'Magic Link'}
                        </Button>

                        {/* Toggle Access */}
                        <Button
                          variant={credential.portalAccess ? "destructive" : "default"}
                          size="sm"
                          onClick={() => togglePortalAccessMutation.mutate({
                            clientId: credential.clientId,
                            enabled: !credential.portalAccess
                          })}
                          disabled={togglePortalAccessMutation.isPending}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {credential.portalAccess ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              variant="outline"
              onClick={() => {
                // Send welcome emails to all clients with portal access
                console.log("Sending welcome emails to all clients...");
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Welcome Emails
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Reset all active client portal sessions
                console.log("Resetting all client portal sessions...");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All Sessions
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Portal Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Client Portal Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Portal Customization */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Branding</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Portal Title</Label>
                          <Input defaultValue="CapturedCCollective - Client Portal" />
                        </div>
                        <div>
                          <Label>Welcome Message</Label>
                          <Textarea defaultValue="Welcome to your personal photography portal! View your galleries, download photos, and track your session progress." />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Access Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Auto-expire sessions</Label>
                          <Button variant="outline" size="sm">30 days</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Download limits</Label>
                          <Button variant="outline" size="sm">Unlimited</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Gallery protection</Label>
                          <Button variant="outline" size="sm">Password</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Email Templates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Email Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Welcome Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Magic Link Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4 mr-2" />
                          Gallery Ready
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Client Details: {selectedClient.clientName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{selectedClient.clientEmail}</p>
              </div>
              <div>
                <Label>Portal Access</Label>
                <Badge variant={selectedClient.portalAccess ? "default" : "secondary"}>
                  {selectedClient.portalAccess ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <Label>Last Login</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.lastLogin ? new Date(selectedClient.lastLogin).toLocaleDateString() : "Never"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customEmail">Send Magic Link to Custom Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="customEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      if (magicLinkEmail) {
                        // Send magic link to custom email
                        sendMagicLink(selectedClient.clientId);
                        setMagicLinkEmail("");
                      }
                    }}
                    disabled={!magicLinkEmail}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}