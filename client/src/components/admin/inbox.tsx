import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  Trash,
  Reply,
  Archive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export function AdminInbox() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/contact-messages"],
    queryFn: async () => {
      const response = await fetch("/api/contact-messages");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update message status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({
        title: "Status updated",
        description: "Message status has been updated successfully.",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      setSelectedMessage(null);
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-100 text-red-800";
      case "read":
        return "bg-yellow-100 text-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <Mail className="h-4 w-4" />;
      case "read":
        return <Clock className="h-4 w-4" />;
      case "replied":
        return <CheckCircle className="h-4 w-4" />;
      case "archived":
        return <Archive className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const filteredMessages = messages.filter((message: ContactMessage) => {
    const statusMatch =
      statusFilter === "all" || message.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || message.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const unreadCount = messages.filter(
    (m: ContactMessage) => m.status === "unread",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inbox</h2>
          <p className="text-muted-foreground">
            Manage contact form submissions and client inquiries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {messages.length} Total Messages
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} Unread</Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No messages found</p>
              <p className="text-sm">
                Messages from your contact form will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message: ContactMessage) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    message.status === "unread"
                      ? "border-blue-200 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{message.name}</h3>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1">{message.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {message.email} • {message.phone || "No phone"}
                      </p>
                      <p className="font-medium mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>
                        {new Date(message.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      {selectedMessage && (
        <Dialog
          open={!!selectedMessage}
          onOpenChange={() => setSelectedMessage(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span>Message from {selectedMessage.name}</span>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority}
                </Badge>
                <Badge className={getStatusColor(selectedMessage.status)}>
                  {selectedMessage.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{selectedMessage.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone</Label>
                  <p>{selectedMessage.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="font-medium">Received</Label>
                  <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Source</Label>
                  <p className="capitalize">{selectedMessage.source}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Subject</Label>
                <p className="text-lg">{selectedMessage.subject}</p>
              </div>

              <div>
                <Label className="font-medium">Message</Label>
                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                  <p className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <Select
                    value={selectedMessage.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({
                        id: selectedMessage.id,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`,
                      )
                    }
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteMessageMutation.mutate(selectedMessage.id)
                  }
                  disabled={deleteMessageMutation.isPending}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
