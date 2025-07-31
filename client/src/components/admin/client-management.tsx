import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClients, fetchBookings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Eye
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  tags: string[];
  status: string;
  leadSource: string;
  leadScore: number;
  instagramHandle: string;
  anniversaryDate: string;
  preferredCommunication: string;
  timezone: string;
  lastContact: Date | null;
  nextFollowUp: Date | null;
  lifetimeValue: string;
  referralSource: string;
  customFields: Record<string, unknown>;
  createdAt: Date;
}

interface Booking {
  id: number;
  clientId: number;
  serviceId: number;
  date: string;
  duration: number;
  location: string;
  totalPrice: string;
  depositPaid: boolean;
  status: string;
  notes: string;
  addOns: Array<{id: string, name: string, price: number}>;
  createdAt: Date;
}

const addClientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  status: z.string().optional(),
  leadSource: z.string().optional(),
  preferredCommunication: z.string().optional(),
  timezone: z.string().optional(),
  leadScore: z.number().optional(),
  lifetimeValue: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

function AddClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addClientFormSchema>>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "lead",
      leadSource: "website",
      preferredCommunication: "email",
      timezone: "America/New_York",
      leadScore: 0,
      lifetimeValue: "0.00",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: (data: z.infer<typeof addClientFormSchema>) =>
      apiRequest("POST", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof addClientFormSchema>) => {
    createClientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="client@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(808) 555-0123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about the client..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onSuccess?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createClientMutation.isPending}
            className="btn-bronze"
          >
            {createClientMutation.isPending ? "Adding..." : "Add Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: fetchClients,
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: fetchBookings,
  });

  const filteredClients = clients?.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getClientBookings = (clientId: number) => {
    return bookings?.filter((booking: Booking) => booking.clientId === clientId) || [];
  };

  const getClientStats = (clientId: number) => {
    const clientBookings = getClientBookings(clientId);
    const totalSpent = clientBookings.reduce((sum: number, booking: Booking) => 
      sum + parseFloat(booking.totalPrice), 0
    );
    
    return {
      totalBookings: clientBookings.length,
      totalSpent,
      lastBooking: clientBookings.length > 0 
        ? new Date(Math.max(...clientBookings.map((b: Booking) => new Date(b.date).getTime())))
        : null,
    };
  };

  if (clientsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Client Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Client Management
          </CardTitle>
          <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-bronze">
                <Plus className="h-4 w-4 mr-1" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <AddClientForm onSuccess={() => setAddClientDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Booking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client: Client) => {
                  const stats = getClientStats(client.id);
                  
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.tags && client.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {client.tags.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {stats.totalBookings}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center font-medium">
                          <DollarSign className="h-4 w-4 mr-1 text-bronze" />
                          ${stats.totalSpent.toLocaleString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {stats.lastBooking ? (
                          <span className="text-sm">
                            {stats.lastBooking.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{client.name}</DialogTitle>
                            </DialogHeader>
                            <ClientDetails client={client} bookings={getClientBookings(client.id)} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientDetails({ client, bookings }: { client: Client; bookings: Booking[] }) {
  const totalSpent = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0);

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              {client.email}
            </div>
            {client.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {client.phone}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Statistics</h4>
          <div className="space-y-2 text-sm">
            <div>Total Bookings: <strong>{bookings.length}</strong></div>
            <div>Total Spent: <strong>${totalSpent.toLocaleString()}</strong></div>
            <div>Client Since: <strong>{new Date(client.createdAt).toLocaleDateString()}</strong></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div>
          <h4 className="font-semibold mb-2">Notes</h4>
          <p className="text-sm bg-muted p-3 rounded">{client.notes}</p>
        </div>
      )}

      {/* Booking History */}
      <div>
        <h4 className="font-semibold mb-2">Booking History</h4>
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking: Booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div>
                  <p className="font-medium">Photography Service</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString()} at {booking.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${parseFloat(booking.totalPrice).toLocaleString()}</p>
                  <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
            {bookings.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                And {bookings.length - 5} more bookings...
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
