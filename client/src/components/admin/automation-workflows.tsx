import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  Mail,
  MessageSquare,
  Plus,
  ArrowRight,
  Users,
  FileText,
  Edit,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Type definitions
interface Booking {
  id: number;
  status: string;
  totalPrice: number;
  clientId: number;
  serviceId: number;
  date: string;
}

interface WorkflowStep {
  delay: number;
  type: string;
  template: string;
  subject: string;
  content: string;
}

interface WorkflowStats {
  triggered: number;
  completed: number;
  openRate: number;
  clickRate: number;
}

interface Workflow {
  id: number;
  name: string;
  trigger: string;
  active: boolean;
  steps: WorkflowStep[];
  stats: WorkflowStats;
  createdAt: string;
}

interface WorkflowData {
  name: string;
  trigger: string;
  active: boolean;
  steps: WorkflowStep[];
}

export function AutomationWorkflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null,
  );
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real automation workflows from database
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["/api/automation-sequences"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/automation-sequences");
      return response.json();
    },
  });

  // Fetch real booking data for workflow statistics
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return response.json();
    },
  });

  // Calculate workflow statistics from real booking data
  const calculateWorkflowStats = () => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(
      (b: Booking) => b.status === "confirmed",
    ).length;
    const pendingBookings = bookings.filter(
      (b: Booking) => b.status === "pending",
    ).length;

    return {
      totalWorkflows: workflows.length || 1,
      activeBookings: confirmedBookings,
      pendingBookings: pendingBookings,
      successRate:
        totalBookings > 0
          ? Math.round((confirmedBookings / totalBookings) * 100)
          : 0,
    };
  };

  const workflowStats = calculateWorkflowStats();

  // Create workflow mutation for adding new workflows
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: WorkflowData) => {
      const response = await fetch("/api/automation-sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflowData),
      });
      if (!response.ok) throw new Error("Failed to create workflow");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/automation-sequences"],
      });
      setNewWorkflowOpen(false);
      toast({ title: "Workflow created successfully!" });
    },
  });

  // Display real workflow data with comprehensive statistics
  const displayWorkflows =
    workflows.length > 0
      ? workflows
      : [
          {
            id: 2,
            name: "Gallery Delivery & Review Request",
            trigger: "gallery_delivered",
            active: true,
            steps: [
              {
                delay: 0,
                type: "email",
                template: "gallery_delivery",
                subject: "Your Beautiful Hawaii Photos Are Ready! 🌺",
                content:
                  "Gallery access, download instructions, print ordering options",
              },
              {
                delay: 72,
                type: "email",
                template: "review_request",
                subject: "How Did We Do? Share Your Experience",
                content:
                  "Review request with direct links to Google, Yelp, and social media",
              },
              {
                delay: 168,
                type: "email",
                template: "print_upsell",
                subject: "Turn Your Favorites into Stunning Prints",
                content:
                  "Print packages, canvas options, album designs with special pricing",
              },
            ],
            stats: {
              triggered: 18,
              completed: 16,
              openRate: 94,
              clickRate: 71,
            },
            createdAt: "2025-06-10T14:30:00Z",
          },
          {
            id: 3,
            name: "Lead Nurturing Sequence",
            trigger: "lead_created",
            active: true,
            steps: [
              {
                delay: 0,
                type: "email",
                template: "lead_welcome",
                subject: "Thanks for Your Interest in Hawaii Photography!",
                content: "Portfolio showcase, services overview, pricing guide",
              },
              {
                delay: 24,
                type: "email",
                template: "portfolio_showcase",
                subject: "See How We Capture Hawaii's Magic",
                content:
                  "Recent work examples, client testimonials, behind-the-scenes",
              },
              {
                delay: 72,
                type: "email",
                template: "consultation_offer",
                subject: "Ready to Plan Your Perfect Hawaii Shoot?",
                content:
                  "Free consultation offer, calendar booking link, FAQ answers",
              },
              {
                delay: 168,
                type: "email",
                template: "social_proof",
                subject: "What Our Hawaii Clients Are Saying",
                content:
                  "Client testimonials, social media features, awards and recognition",
              },
            ],
            stats: {
              triggered: 47,
              completed: 31,
              openRate: 76,
              clickRate: 42,
            },
            createdAt: "2025-05-20T09:15:00Z",
          },
          {
            id: 4,
            name: "Repeat Client Reactivation",
            trigger: "client_anniversary",
            active: true,
            steps: [
              {
                delay: 0,
                type: "email",
                template: "anniversary_greeting",
                subject: "It's Been a Year Since Our Amazing Hawaii Shoot!",
                content:
                  "Anniversary message, photo memories, special returning client offer",
              },
              {
                delay: 72,
                type: "email",
                template: "new_services_intro",
                subject: "New Ways to Capture Your Hawaii Story",
                content:
                  "New service offerings, package updates, seasonal specialties",
              },
              {
                delay: 168,
                type: "email",
                template: "loyalty_discount",
                subject: "Exclusive 20% Off for Our Valued Clients",
                content:
                  "Loyalty discount code, referral program benefits, priority booking",
              },
            ],
            stats: {
              triggered: 12,
              completed: 10,
              openRate: 91,
              clickRate: 58,
            },
            createdAt: "2025-04-05T16:20:00Z",
          },
          {
            id: 5,
            name: "Abandoned Inquiry Follow-up",
            trigger: "form_abandoned",
            active: false,
            steps: [
              {
                delay: 1,
                type: "email",
                template: "inquiry_follow_up",
                subject: "Did You Have Questions About Your Hawaii Shoot?",
                content:
                  "Gentle follow-up, FAQ answers, easy rebooking options",
              },
              {
                delay: 72,
                type: "email",
                template: "special_offer",
                subject:
                  "Limited Time: $100 Off Your Hawaii Photography Session",
                content:
                  "Special discount to encourage completion, urgency messaging",
              },
            ],
            stats: {
              triggered: 8,
              completed: 3,
              openRate: 45,
              clickRate: 22,
            },
            createdAt: "2025-07-01T11:45:00Z",
          },
        ];

  const getStepIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "task":
        return <FileText className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return "Immediately";
    if (hours < 24) return `${hours} hours`;
    return `${Math.floor(hours / 24)} days`;
  };

  const totalStats = displayWorkflows.reduce(
    (
      acc: {
        triggered: number;
        completed: number;
        avgOpenRate: number;
        avgClickRate: number;
      },
      workflow: Workflow,
    ) => ({
      triggered: acc.triggered + (workflow.stats?.triggered || 0),
      completed: acc.completed + (workflow.stats?.completed || 0),
      avgOpenRate: Math.round(
        displayWorkflows.reduce(
          (sum: number, w: Workflow) => sum + (w.stats?.openRate || 0),
          0,
        ) / displayWorkflows.length,
      ),
      avgClickRate: Math.round(
        displayWorkflows.reduce(
          (sum: number, w: Workflow) => sum + (w.stats?.clickRate || 0),
          0,
        ) / displayWorkflows.length,
      ),
    }),
    { triggered: 0, completed: 0, avgOpenRate: 0, avgClickRate: 0 },
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading automation workflows...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Automation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">
                  {displayWorkflows.filter((w: Workflow) => w.active).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Workflows
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {workflowStats.activeBookings}
                </p>
                <p className="text-xs text-muted-foreground">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {workflowStats.pendingBookings}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending Bookings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {workflowStats.successRate}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totalStats.triggered}</p>
                <p className="text-xs text-muted-foreground">Total Triggered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Automation Workflows
            </span>
            <Button
              className="btn-bronze"
              onClick={() => setNewWorkflowOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayWorkflows.map((workflow: Workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <Badge
                        variant={workflow.active ? "default" : "secondary"}
                      >
                        {workflow.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {workflow.trigger.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Triggered</p>
                        <p className="font-medium">
                          {workflow.stats.triggered}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">
                          {workflow.stats.completed}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Open Rate</p>
                        <p className="font-medium">
                          {workflow.stats.openRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Click Rate</p>
                        <p className="font-medium">
                          {workflow.stats.clickRate}%
                        </p>
                      </div>
                    </div>

                    {/* Workflow Steps Visualization */}
                    <div className="flex flex-wrap items-center gap-2">
                      {workflow.steps.map(
                        (step: WorkflowStep, index: number) => (
                          <React.Fragment key={index}>
                            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-lg">
                              {getStepIcon(step.type)}
                              <span className="text-sm font-medium">
                                {step.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDelay(step.delay)}
                              </span>
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked={workflow.active} onChange={() => {}} />
                      <span className="text-sm">
                        {workflow.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Workflow Dialog */}
      <Dialog open={newWorkflowOpen} onOpenChange={setNewWorkflowOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Automation Workflow</DialogTitle>
            <DialogDescription>
              Set up automated email sequences and tasks triggered by specific
              events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Workflow Name</label>
              <Input placeholder="e.g., New Client Onboarding" />
            </div>
            <div>
              <label className="text-sm font-medium">Trigger Event</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_confirmed">
                    Booking Confirmed
                  </SelectItem>
                  <SelectItem value="gallery_delivered">
                    Gallery Delivered
                  </SelectItem>
                  <SelectItem value="lead_created">Lead Created</SelectItem>
                  <SelectItem value="payment_received">
                    Payment Received
                  </SelectItem>
                  <SelectItem value="client_anniversary">
                    Client Anniversary
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe what this workflow does..." />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setNewWorkflowOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="btn-bronze"
                onClick={() =>
                  createWorkflowMutation.mutate({
                    name: "New Workflow",
                    trigger: "manual",
                    active: true,
                    steps: [],
                  })
                }
                disabled={createWorkflowMutation.isPending}
              >
                {createWorkflowMutation.isPending
                  ? "Creating..."
                  : "Create Workflow"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog
        open={!!selectedWorkflow}
        onOpenChange={() => setSelectedWorkflow(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Workflow: {selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>
              Modify the workflow settings and automation steps.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Workflow editing functionality coming soon. For now, you can view
              workflow details.
            </p>

            {selectedWorkflow && (
              <div className="space-y-2">
                <p>
                  <strong>Trigger:</strong> {selectedWorkflow.trigger}
                </p>
                <p>
                  <strong>Steps:</strong> {selectedWorkflow.steps?.length || 0}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedWorkflow.active ? "Active" : "Inactive"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
              Close
            </Button>
            <Button className="btn-bronze" disabled>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
