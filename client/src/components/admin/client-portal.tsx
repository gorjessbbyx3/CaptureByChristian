import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Globe, 
  Download, 
  CreditCard, 
  Calendar,
  Eye,
  Link,
  Activity,
  Clock,
  FileText,
  Image,
  DollarSign,
  Settings,
  Shield,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export function ClientPortal() {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  // Fetch real client portal sessions from database
  const { data: portalSessions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/client-portal-sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/client-portal-sessions');
      return response.json();
    },
  });

  // Fetch real portal statistics
  const { data: portalStats = {
    activeUsers: 0,
    totalSessions: 0,
    avgSessionTime: '0m',
    downloadCount: 0,
    accessRate: 0,
    avgRating: 0
  } } = useQuery({
    queryKey: ['/api/admin/client-portal-stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/client-portal-stats');
        return response.json();
      } catch (error) {
        console.error('Failed to fetch portal stats:', error);
        return {
          activeUsers: 0,
          totalSessions: 0,
          avgSessionTime: '0m',
          downloadCount: 0,
          accessRate: 0,
          avgRating: 0
        };
      }
    },
  });

  // Fetch clients for gallery upload
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/clients');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        return [];
      }
    },
  });

  // Fetch bookings for client selection
  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bookings');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Gallery upload mutation
  const uploadGalleryMutation = useMutation({
    mutationFn: async ({ files, clientId, bookingId }: { files: File[], clientId: number, bookingId?: number }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('category', 'client_gallery');
      formData.append('clientId', clientId.toString());
      if (bookingId) {
        formData.append('bookingId', bookingId.toString());
      }

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setSelectedClient(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadGallery = () => {
    if (!selectedClient || selectedFiles.length === 0) return;

    // Find the client's most recent booking
    const clientBookings = bookings.filter((b: any) => b.clientId === selectedClient.id);
    const mostRecentBooking = clientBookings.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    uploadGalleryMutation.mutate({
      files: selectedFiles,
      clientId: selectedClient.id,
      bookingId: mostRecentBooking?.id
    });
  };

  // Loading state
  if (isLoading || isLoadingClients) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading client portal data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login": return <Shield className="h-3 w-3" />;
      case "gallery_view": return <Image className="h-3 w-3" />;
      case "download": return <Download className="h-3 w-3" />;
      case "payment": return <CreditCard className="h-3 w-3" />;
      case "invoice_view": return <FileText className="h-3 w-3" />;
      case "contract_view": return <FileText className="h-3 w-3" />;
      case "contract_sign": return <FileText className="h-3 w-3" />;
      case "questionnaire": return <FileText className="h-3 w-3" />;
      case "favorites": return <Eye className="h-3 w-3" />;
      case "booking_update": return <Calendar className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login": return "text-blue-600";
      case "gallery_view": return "text-purple-600";
      case "download": return "text-green-600";
      case "payment": return "text-green-700";
      case "invoice_view": return "text-orange-600";
      case "contract_view": return "text-gray-600";
      case "contract_sign": return "text-green-600";
      case "questionnaire": return "text-blue-600";
      case "favorites": return "text-red-600";
      case "booking_update": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Portal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">{portalStats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{portalStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{portalStats.avgSessionTime}</p>
                <p className="text-xs text-muted-foreground">Avg Session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{portalStats.downloadCount}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{portalStats.paymentCount}</p>
                <p className="text-xs text-muted-foreground">Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-lg font-bold">Gallery</p>
                <p className="text-xs text-muted-foreground">Top Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Portal Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Client Portal Activity
            </span>
            <div className="flex space-x-2">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-bronze">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Client Gallery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Gallery for Client</DialogTitle>
                    <DialogDescription>
                      Select a client and upload photos and videos to their private gallery.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Client</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={selectedClient?.id || ''}
                        onChange={(e) => {
                          const client = clients.find((c: any) => c.id === parseInt(e.target.value));
                          setSelectedClient(client);
                        }}
                      >
                        <option value="">Choose a client...</option>
                        {clients && clients.length > 0 ? clients.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </option>
                        )) : (
                          <option disabled>No clients available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Select Photos & Videos</label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="mt-1"
                      />
                      {selectedFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFiles.length} file(s) selected
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUploadGallery}
                        disabled={!selectedClient || selectedFiles.length === 0 || uploadGalleryMutation.isPending}
                        className="btn-bronze"
                      >
                        {uploadGalleryMutation.isPending ? 'Uploading...' : 'Upload Gallery'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline"
                onClick={() => {
                  console.log("Opening portal settings...");
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Portal Settings
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portalSessions.map((session: any) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{session.clientName}</h3>
                      <Badge variant={session.status === "active" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{session.device}</span>
                      <span className="text-sm text-muted-foreground">{session.location}</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <p><strong>Last Access:</strong> {format(new Date(session.lastAccess), "MMM d, yyyy 'at' h:mm a")}</p>
                        <p><strong>IP Address:</strong> {session.ipAddress}</p>
                      </div>
                      <div>
                        <p><strong>Session ID:</strong> {session.sessionToken}</p>
                        <p><strong>Activities:</strong> {session.activities.length}</p>
                      </div>
                      <div>
                        <p><strong>User Agent:</strong> {session.userAgent.split(" ")[0]}</p>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Activities</h4>
                      <div className="space-y-2">
                        {session.activities.slice(-3).map((activity: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className={`${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(activity.timestamp), "h:mm a")}
                            </span>
                            <span>{activity.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedSession(session)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Link className="h-3 w-3 mr-1" />
                      Generate Link
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Portal Session Details - {selectedSession?.clientName}
            </DialogTitle>
            <DialogDescription>
              View detailed session information and complete activity log for this client.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Session Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Session ID:</strong> {selectedSession.sessionToken}</p>
                    <p><strong>IP Address:</strong> {selectedSession.ipAddress}</p>
                    <p><strong>Device:</strong> {selectedSession.device}</p>
                    <p><strong>Location:</strong> {selectedSession.location}</p>
                    <p><strong>Status:</strong> <Badge variant={selectedSession.status === "active" ? "default" : "secondary"}>{selectedSession.status}</Badge></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Access Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Last Access:</strong> {format(new Date(selectedSession.lastAccess), "PPP 'at' p")}</p>
                    <p><strong>User Agent:</strong> {selectedSession.userAgent}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Complete Activity Log</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedSession.activities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 text-sm p-2 bg-muted/50 rounded">
                      <div className={`${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <span className="text-muted-foreground">
                        {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                      </span>
                      <span className="flex-1">{activity.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}