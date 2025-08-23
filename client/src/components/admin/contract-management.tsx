import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Plus,
  Send,
  Edit,
  Eye,
  Download,
  Clock,
  CheckCircle,
  Users,
  Building,
  Calendar,
  DollarSign,
  Copy,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Default contract templates based on the attached files
const INDIVIDUAL_CONTRACT_TEMPLATE = `📄 Media Services Contract Template – Individual Clients
CapturedCCollective – Media Services Agreement

This Agreement is made on [DATE] between:

Media Team: CapturedCCollective
Client: [CLIENT_NAME]
Email: [CLIENT_EMAIL]
Phone: [CLIENT_PHONE]

Event/Session Type: [SERVICE_TYPE]
Date of Session: [SESSION_DATE]
Location: [LOCATION]

1. Scope of Services
CapturedCCollective agrees to provide professional media services including capturing, editing, and delivering digital content. Package selected: [PACKAGE_TYPE]

2. Payment Terms
Total Fee: $[TOTAL_AMOUNT]
Retainer (Non-refundable): $[RETAINER_AMOUNT] due upon booking
Balance Due: $[BALANCE_AMOUNT] on or before the session date
Accepted payment: Cash / Card / Venmo / Zelle

3. Deliverables
[DELIVERABLES]
Timeline: [TIMELINE]

4. Image Rights & Usage
[USAGE_RIGHTS]

5. Cancellation & Rescheduling
[CANCELLATION_POLICY]

6. Liability
CapturedCCollective is not liable for any damages, loss of files due to technical failure, or unforeseen circumstances beyond control (e.g., weather, emergency).

[ADDITIONAL_TERMS]

Client Signature: ___________________________
CapturedCCollective Representative: ___________
Date: ______________`;

const BUSINESS_CONTRACT_TEMPLATE = `📄 Commercial Photography Contract – Businesses & Brands
Photography Services Agreement – Capture By Christian

This Commercial Agreement is made on [DATE] between:

Photographer: Capture By Christian (Christian Picaso)
Business Client: [CLIENT_NAME]
Contact Person: [CONTACT_PERSON]
Email: [CLIENT_EMAIL]
Phone: [CLIENT_PHONE]

Project Type: [SERVICE_TYPE]
Date(s) of Service: [SESSION_DATE]
Location(s): [LOCATION]

1. Scope of Work
Photographer will capture, edit, and deliver high-resolution digital images according to the following deliverables:
[DELIVERABLES]

2. Licensing
[USAGE_RIGHTS]

3. Payment Terms
Total Fee: $[TOTAL_AMOUNT]
Retainer: $[RETAINER_AMOUNT] due upon signing
Final Balance Due: $[BALANCE_AMOUNT] by delivery date
Late Payment Fee: 5% after 10 business days

4. Turnaround & Delivery
Timeline: [TIMELINE]

5. Cancellation Policy
[CANCELLATION_POLICY]

6. Credits & Promotion
Photographer may use images for portfolio, social media, and promotional purposes unless the client provides written opt-out.

[ADDITIONAL_TERMS]

Authorized Representative (Client): ____________________
Capture By Christian (Photographer): ____________________
Date: ______________`;

interface Contract {
  id: number;
  bookingId?: number;
  clientId: number;
  contractType: "individual" | "business";
  serviceType?: string;
  status: "draft" | "sent" | "signed" | "completed" | "cancelled";
  title: string;
  templateContent: string;
  signedContent?: string;
  sessionDate?: string;
  location?: string;
  packageType?: string;
  totalAmount?: number;
  retainerAmount?: number;
  balanceAmount?: number;
  paymentTerms?: string;
  deliverables?: string;
  timeline?: string;
  usageRights?: string;
  cancellationPolicy?: string;
  additionalTerms?: string;
  signatureData?: string;
  signedAt?: string;
  photographerSignature?: string;
  photographerSignedAt?: string;
  signatureRequestSent?: string;
  portalAccessToken?: string;
  clientSignedAt?: string;
  isFullySigned?: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export function ContractManagement() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [newContractOpen, setNewContractOpen] = useState(false);
  const [viewContractOpen, setViewContractOpen] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [contractForm, setContractForm] = useState({
    contractType: "individual" as "individual" | "business",
    clientId: "",
    serviceType: "",
    title: "",
    sessionDate: "",
    location: "",
    packageType: "",
    totalAmount: "",
    retainerAmount: "",
    balanceAmount: "",
    deliverables: "",
    timeline: "",
    usageRights: "",
    cancellationPolicy: "",
    additionalTerms: "",
    paymentTerms: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts"],
    queryFn: async () => {
      const response = await fetch("/api/contracts");
      if (!response.ok) throw new Error("Failed to fetch contracts");
      return response.json();
    },
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contractData: Record<string, unknown>) => {
      console.log("Sending contract data:", contractData);
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server validation errors:", errorData.details);
        const errorMessage = errorData.details
          ? `Validation errors: ${errorData.details.map((d: { path: string[]; message: string }) => `${d.path.join(".")}: ${d.message}`).join(", ")}`
          : errorData.error || "Failed to create contract";
        throw new Error(errorMessage);
      }
      return response.json();
    },
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setNewContractOpen(false);
      resetForm();
      toast({
        title: "Contract created successfully!",
        description: `Contract "${newContract.title}" has been created and is ready to send.`,
      });
    },
    onError: (error: Error) => {
      console.error("Contract creation error:", error);
      toast({
        title: "Failed to create contract",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send contract mutation
  const sendContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      const response = await fetch(`/api/contracts/${contractId}/send`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to send contract");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contract sent to client's portal successfully!" });
    },
  });

  // AI assistance mutation using Replit AI agents
  const aiAssistMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/replit-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `As a professional photography business consultant AI agent, analyze this session request: "${prompt}"

Please provide specific contract recommendations in this exact format:

Service Type: [specific service like "Wedding Photography", "Portrait Session", "Corporate Event"]
Package Type: [package level like "Premium", "Standard", "Basic"]
Total Amount: [dollar amount without $ symbol, e.g., 1500]
Retainer Amount: [25-50% of total, e.g., 500]
Timeline: [delivery timeframe, e.g., "2-3 weeks after session"]
Deliverables: [what client receives, e.g., "50-75 edited high-resolution images via online gallery"]
Usage Rights: [how client can use photos, e.g., "Personal use, social media sharing permitted"]
Cancellation Policy: [terms for changes, e.g., "48-hour notice required for rescheduling"]
Additional Terms: [special considerations based on the request]

Base your recommendations on current photography industry standards and the specific details mentioned in the request.`,
          sessionId: "contract-assist-" + Date.now(),
          agent: "photography-business-consultant",
        }),
      });
      if (!response.ok)
        throw new Error("Failed to get AI assistance from Replit agents");
      const data = await response.json();
      return data.response;
    },
    onSuccess: (response) => {
      setAiSuggestions(response);
      toast({
        title: "Replit AI suggestions generated! Review and apply them below.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to get Replit AI assistance",
        variant: "destructive",
      });
    },
  });

  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;

    // Parse the AI response for specific values with improved parsing
    const lines = aiSuggestions.split("\n");

    lines.forEach((line: string) => {
      const lower = line.toLowerCase();
      if (lower.includes("service type") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value) setContractForm((prev) => ({ ...prev, serviceType: value }));
      } else if (lower.includes("package type") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value) setContractForm((prev) => ({ ...prev, packageType: value }));
      } else if (lower.includes("total amount") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/[$"[\]]/g, "");
        if (value && !isNaN(Number(value))) {
          setContractForm((prev) => ({ ...prev, totalAmount: value }));
          // Auto-calculate balance if retainer is set
          const retainer = Number(contractForm.retainerAmount) || 0;
          const balance = Number(value) - retainer;
          if (balance > 0) {
            setContractForm((prev) => ({
              ...prev,
              balanceAmount: balance.toString(),
            }));
          }
        }
      } else if (lower.includes("retainer amount") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/[$"[\]]/g, "");
        if (value && !isNaN(Number(value))) {
          setContractForm((prev) => ({ ...prev, retainerAmount: value }));
          // Auto-calculate balance if total is set
          const total = Number(contractForm.totalAmount) || 0;
          const balance = total - Number(value);
          if (balance > 0) {
            setContractForm((prev) => ({
              ...prev,
              balanceAmount: balance.toString(),
            }));
          }
        }
      } else if (lower.includes("timeline") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value) setContractForm((prev) => ({ ...prev, timeline: value }));
      } else if (lower.includes("deliverables") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value)
          setContractForm((prev) => ({ ...prev, deliverables: value }));
      } else if (lower.includes("usage rights") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value) setContractForm((prev) => ({ ...prev, usageRights: value }));
      } else if (lower.includes("cancellation policy") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value)
          setContractForm((prev) => ({ ...prev, cancellationPolicy: value }));
      } else if (lower.includes("additional terms") && lower.includes(":")) {
        const value = line
          .split(":")[1]
          ?.trim()
          .replace(/["[\]]/g, "");
        if (value)
          setContractForm((prev) => ({ ...prev, additionalTerms: value }));
      }
    });

    setAiAssistOpen(false);
    setAiSuggestions(null);
    setAiPrompt("");
    toast({ title: "Replit AI suggestions applied to contract form!" });
  };

  const resetForm = () => {
    setContractForm({
      contractType: "individual",
      clientId: "",
      serviceType: "",
      title: "",
      sessionDate: "",
      location: "",
      packageType: "",
      totalAmount: "",
      retainerAmount: "",
      balanceAmount: "",
      deliverables: "",
      timeline: "",
      usageRights: "",
      cancellationPolicy: "",
      additionalTerms: "",
      paymentTerms: "",
    });
  };

  const generateContractContent = () => {
    const template =
      contractForm.contractType === "individual"
        ? INDIVIDUAL_CONTRACT_TEMPLATE
        : BUSINESS_CONTRACT_TEMPLATE;

    const selectedClient = clients.find(
      (c: { id: number }) => c.id === parseInt(contractForm.clientId),
    );

    return template
      .replace(/\[DATE\]/g, new Date().toLocaleDateString())
      .replace(/\[CLIENT_NAME\]/g, selectedClient?.name || "")
      .replace(/\[CLIENT_EMAIL\]/g, selectedClient?.email || "")
      .replace(/\[CLIENT_PHONE\]/g, selectedClient?.phone || "")
      .replace(/\[CONTACT_PERSON\]/g, selectedClient?.name || "")
      .replace(/\[SERVICE_TYPE\]/g, contractForm.serviceType || "")
      .replace(/\[SESSION_DATE\]/g, contractForm.sessionDate || "")
      .replace(/\[LOCATION\]/g, contractForm.location || "")
      .replace(/\[PACKAGE_TYPE\]/g, contractForm.packageType || "")
      .replace(/\[TOTAL_AMOUNT\]/g, contractForm.totalAmount || "")
      .replace(/\[RETAINER_AMOUNT\]/g, contractForm.retainerAmount || "")
      .replace(/\[BALANCE_AMOUNT\]/g, contractForm.balanceAmount || "")
      .replace(/\[DELIVERABLES\]/g, contractForm.deliverables || "")
      .replace(/\[TIMELINE\]/g, contractForm.timeline || "")
      .replace(/\[USAGE_RIGHTS\]/g, contractForm.usageRights || "")
      .replace(
        /\[CANCELLATION_POLICY\]/g,
        contractForm.cancellationPolicy || "",
      )
      .replace(/\[ADDITIONAL_TERMS\]/g, contractForm.additionalTerms || "");
  };

  const handleCreateContract = () => {
    const selectedClient = clients.find(
      (c: { id: number }) => c.id === parseInt(contractForm.clientId),
    );
    if (!selectedClient) {
      toast({ title: "Please select a client", variant: "destructive" });
      return;
    }

    if (!contractForm.title.trim()) {
      toast({ title: "Please enter a contract title", variant: "destructive" });
      return;
    }

    const contractData = {
      clientId: parseInt(contractForm.clientId),
      contractType: contractForm.contractType,
      serviceType: contractForm.serviceType || null,
      title: contractForm.title.trim(),
      templateContent: generateContractContent(),
      sessionDate: contractForm.sessionDate || null,
      location: contractForm.location || null,
      packageType: contractForm.packageType || null,
      totalAmount: contractForm.totalAmount ? contractForm.totalAmount : null,
      retainerAmount: contractForm.retainerAmount
        ? contractForm.retainerAmount
        : null,
      balanceAmount: contractForm.balanceAmount
        ? contractForm.balanceAmount
        : null,
      paymentTerms: contractForm.paymentTerms || null,
      deliverables: contractForm.deliverables || null,
      timeline: contractForm.timeline || null,
      usageRights: contractForm.usageRights || null,
      cancellationPolicy: contractForm.cancellationPolicy || null,
      additionalTerms: contractForm.additionalTerms || null,
      bookingId: null,
    };

    createContractMutation.mutate(contractData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const },
      sent: { label: "Sent", variant: "outline" as const },
      signed: { label: "Signed", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === "business" ? (
      <Building className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Contract Management
          </h2>
          <p className="text-muted-foreground">
            Create, manage, and send photography contracts with e-signature
            capability
          </p>
        </div>
        <Dialog open={newContractOpen} onOpenChange={setNewContractOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Create New Contract</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiAssistOpen(true)}
                  className="ml-auto"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Replit AI Assist
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Contract Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select
                    value={contractForm.contractType}
                    onValueChange={(value: "individual" | "business") =>
                      setContractForm((prev) => ({
                        ...prev,
                        contractType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Individual Client
                        </div>
                      </SelectItem>
                      <SelectItem value="business">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Business Client
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={contractForm.clientId}
                    onValueChange={(value) =>
                      setContractForm((prev) => ({ ...prev, clientId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(
                        (client: {
                          id: number;
                          name: string;
                          email: string;
                        }) => (
                          <SelectItem
                            key={client.id}
                            value={client.id.toString()}
                          >
                            {client.name} ({client.email})
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Title</Label>
                  <Input
                    value={contractForm.title}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Photography Services Agreement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Input
                    value={contractForm.serviceType}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        serviceType: e.target.value,
                      }))
                    }
                    placeholder="Portrait, Wedding, Commercial, etc."
                  />
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Session Date</Label>
                  <Input
                    type="date"
                    value={contractForm.sessionDate}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        sessionDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={contractForm.location}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Session location"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Package Type</Label>
                  <Input
                    value={contractForm.packageType}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        packageType: e.target.value,
                      }))
                    }
                    placeholder="Basic, Premium, Deluxe, etc."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Amount ($)</Label>
                  <Input
                    type="number"
                    value={contractForm.totalAmount}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        totalAmount: e.target.value,
                      }))
                    }
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retainer Amount ($)</Label>
                  <Input
                    type="number"
                    value={contractForm.retainerAmount}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        retainerAmount: e.target.value,
                      }))
                    }
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Balance Amount ($)</Label>
                  <Input
                    type="number"
                    value={contractForm.balanceAmount}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        balanceAmount: e.target.value,
                      }))
                    }
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Contract Terms */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Deliverables</Label>
                  <Textarea
                    value={contractForm.deliverables}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        deliverables: e.target.value,
                      }))
                    }
                    placeholder="Edited digital images: 50-75 photos, Delivery: via online gallery, etc."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Textarea
                    value={contractForm.timeline}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        timeline: e.target.value,
                      }))
                    }
                    placeholder="Within 14 business days from session"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usage Rights</Label>
                  <Textarea
                    value={contractForm.usageRights}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        usageRights: e.target.value,
                      }))
                    }
                    placeholder="The client may use delivered images for personal, non-commercial use..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Textarea
                    value={contractForm.cancellationPolicy}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        cancellationPolicy: e.target.value,
                      }))
                    }
                    placeholder="Client may reschedule up to 48 hours in advance..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Terms</Label>
                  <Textarea
                    value={contractForm.additionalTerms}
                    onChange={(e) =>
                      setContractForm((prev) => ({
                        ...prev,
                        additionalTerms: e.target.value,
                      }))
                    }
                    placeholder="Any additional terms or special conditions..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setNewContractOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateContract}
                  disabled={createContractMutation.isPending}
                >
                  {createContractMutation.isPending
                    ? "Creating..."
                    : "Create Contract"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contracts Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contracts
                </p>
                <p className="text-2xl font-bold">{contracts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Signature
                </p>
                <p className="text-2xl font-bold">
                  {
                    contracts.filter((c: Contract) => c.status === "sent")
                      .length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Signed Contracts
                </p>
                <p className="text-2xl font-bold">
                  {
                    contracts.filter((c: Contract) => c.status === "signed")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  This Month
                </p>
                <p className="text-2xl font-bold">
                  {
                    contracts.filter(
                      (c: Contract) =>
                        new Date(c.createdAt).getMonth() ===
                        new Date().getMonth(),
                    ).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first photography contract to get started
              </p>
              <Button onClick={() => setNewContractOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Contract
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract: Contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(contract.contractType)}
                      <div>
                        <h4 className="font-medium">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.client?.name} • {contract.serviceType}
                          {contract.sessionDate && (
                            <>
                              {" "}
                              •{" "}
                              {format(
                                new Date(contract.sessionDate),
                                "MMM dd, yyyy",
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(contract.status)}
                      {contract.totalAmount && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />$
                          {contract.totalAmount}
                        </Badge>
                      )}
                      {/* E-signature status indicators */}
                      <div className="flex items-center space-x-1">
                        {contract.clientSignedAt && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Client Signed</span>
                          </div>
                        )}
                        {contract.photographerSignedAt && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Photographer Signed</span>
                          </div>
                        )}
                        {contract.isFullySigned && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Fully Executed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract);
                          setViewContractOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {contract.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            sendContractMutation.mutate(contract.id)
                          }
                          disabled={sendContractMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {sendContractMutation.isPending
                            ? "Sending..."
                            : "Send"}
                        </Button>
                      )}
                      {contract.status === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const portalLink = `${window.location.origin}/client-portal?token=${contract.portalAccessToken}`;
                            navigator.clipboard.writeText(portalLink);
                            toast({
                              title: "Portal link copied to clipboard!",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Contract Dialog */}
      <Dialog open={viewContractOpen} onOpenChange={setViewContractOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{selectedContract?.title}</span>
              {selectedContract && getStatusBadge(selectedContract.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Contract Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Client:</span>{" "}
                      {selectedContract.client?.name}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedContract.contractType}
                    </p>
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      {selectedContract.serviceType || "N/A"}
                    </p>
                    {selectedContract.sessionDate && (
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {format(
                          new Date(selectedContract.sessionDate),
                          "MMM dd, yyyy",
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Financial Details</h4>
                  <div className="space-y-1 text-sm">
                    {selectedContract.totalAmount && (
                      <p>
                        <span className="font-medium">Total:</span> $
                        {selectedContract.totalAmount}
                      </p>
                    )}
                    {selectedContract.retainerAmount && (
                      <p>
                        <span className="font-medium">Retainer:</span> $
                        {selectedContract.retainerAmount}
                      </p>
                    )}
                    {selectedContract.balanceAmount && (
                      <p>
                        <span className="font-medium">Balance:</span> $
                        {selectedContract.balanceAmount}
                      </p>
                    )}
                    {selectedContract.location && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {selectedContract.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contract Content */}
              <div>
                <h4 className="font-semibold mb-2">Contract Content</h4>
                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {selectedContract.templateContent}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {selectedContract.status === "draft" && (
                    <Button
                      onClick={() =>
                        sendContractMutation.mutate(selectedContract.id)
                      }
                      disabled={sendContractMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendContractMutation.isPending
                        ? "Sending..."
                        : "Send to Client Portal"}
                    </Button>
                  )}
                  {selectedContract.status === "sent" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const portalLink = `${window.location.origin}/client-portal?token=${selectedContract.portalAccessToken}`;
                        navigator.clipboard.writeText(portalLink);
                        toast({ title: "Portal link copied to clipboard!" });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Portal Link
                    </Button>
                  )}
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setViewContractOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedContract.status === "draft" && (
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Contract Assistant Dialog */}
      <Dialog open={aiAssistOpen} onOpenChange={setAiAssistOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Replit AI Contract Assistant</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Describe your photography session</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Wedding photography for 150 guests at beachfront venue, 8-hour coverage, need drone shots for ceremony..."
                rows={4}
              />
            </div>

            {!aiSuggestions ? (
              <>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">
                    Replit AI will help suggest:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Service type and package recommendations</li>
                    <li>• Industry-standard pricing structure</li>
                    <li>• Professional timeline and deliverables</li>
                    <li>• Appropriate usage rights and policies</li>
                    <li>• Standard cancellation terms</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setAiAssistOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => aiAssistMutation.mutate(aiPrompt)}
                    disabled={!aiPrompt.trim() || aiAssistMutation.isPending}
                  >
                    {aiAssistMutation.isPending
                      ? "Getting Replit AI suggestions..."
                      : "Get Replit AI Suggestions"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">AI Suggestions:</h4>
                  <div className="bg-muted/50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {aiSuggestions}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-between space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestions);
                      toast({ title: "AI suggestions copied to clipboard!" });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Suggestions
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAiSuggestions(null);
                        setAiPrompt("");
                      }}
                    >
                      Start Over
                    </Button>
                    <Button onClick={applyAiSuggestions}>Apply to Form</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
