import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Users,
  TrendingUp,
  Eye,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Target,
  UserPlus,
  Filter,
  Search,
  Instagram,
  Globe,
  Zap,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function LeadManagement() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch real contact messages as leads
  const { data: contactMessages = [] } = useQuery({
    queryKey: ["/api/contact-messages"],
    queryFn: async () => {
      const response = await fetch("/api/contact-messages");
      if (!response.ok) throw new Error("Failed to fetch contact messages");
      return response.json();
    },
  });

  // Transform contact messages into lead format
  const leads = contactMessages.map((message: any) => ({
    id: message.id,
    clientId: null, // Not linked to clients yet
    source: "website", // All from contact form
    medium: "organic",
    campaign: "contact_form",
    formData: {
      name: message.name,
      email: message.email,
      phone: message.phone || "Not provided",
      eventType: message.eventType || "general_inquiry",
      preferredDate: message.preferredDate || "Not specified",
      guestCount: 0,
      budget: "Not specified",
      message: message.message,
    },
    score: Math.min(
      95,
      40 +
        (message.priority === "urgent" ? 30 : 20) +
        (message.email ? 10 : 0) +
        (message.phone ? 10 : 0),
    ),
    temperature:
      message.priority === "urgent"
        ? "hot"
        : message.status === "unread"
          ? "warm"
          : "cold",
    qualification: message.status === "unread" ? "new" : "contacted",
    createdAt: message.createdAt,
  }));

  // Filter leads based on search and status
  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch =
      lead.formData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.formData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "hot" && lead.temperature === "hot") ||
      (filterStatus === "qualified" && lead.qualification === "qualified") ||
      (filterStatus === "new" && lead.qualification === "new");

    return matchesSearch && matchesFilter;
  });

  // Calculate lead statistics from real data
  const leadStats = {
    total: leads.length,
    hot: leads.filter((lead: any) => lead.temperature === "hot").length,
    qualified: leads.filter((lead: any) => lead.qualification === "qualified")
      .length,
    avgScore:
      leads.length > 0
        ? Math.round(
            leads.reduce((sum: number, lead: any) => sum + lead.score, 0) /
              leads.length,
          )
        : 0,
    conversionRate:
      leads.length > 0
        ? Math.round(
            (leads.filter((lead: any) => lead.qualification === "qualified")
              .length /
              leads.length) *
              100,
          )
        : 0,
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      case "google":
        return <Search className="h-4 w-4" />;
      case "tiktok":
        return <Zap className="h-4 w-4" />;
      case "referral":
        return <Users className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualificationColor = (qual: string) => {
    switch (qual) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "unqualified":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">{leadStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{leadStats.hot}</p>
                <p className="text-xs text-muted-foreground">Hot Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{leadStats.qualified}</p>
                <p className="text-xs text-muted-foreground">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">{leadStats.avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {leadStats.conversionRate}%
                </p>
                <p className="text-xs text-muted-foreground">Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Lead Pipeline Management
            </span>
            <Button className="btn-bronze">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, email, or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter leads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="hot">Hot Leads</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <div className="space-y-4">
            {filteredLeads.map((lead: any) => (
              <div
                key={lead.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{lead.formData.name}</h3>
                      <Badge className={getTemperatureColor(lead.temperature)}>
                        {lead.temperature}
                      </Badge>
                      <Badge
                        className={getQualificationColor(lead.qualification)}
                      >
                        {lead.qualification}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getSourceIcon(lead.source)}
                        <span className="text-sm text-muted-foreground capitalize">
                          {lead.source}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />{" "}
                          {lead.formData.email}
                        </p>
                        <p className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />{" "}
                          {lead.formData.phone}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Service:</strong> {lead.formData.eventType}
                        </p>
                        <p>
                          <strong>Budget:</strong> {lead.formData.budget}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm mt-2 text-muted-foreground">
                      {lead.formData.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-bronze">
                        {lead.score}/100
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lead Score
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Lead Details</DialogTitle>
                          </DialogHeader>
                          {selectedLead && (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    Contact Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Name:</strong>{" "}
                                      {selectedLead.formData.name}
                                    </p>
                                    <p>
                                      <strong>Email:</strong>{" "}
                                      {selectedLead.formData.email}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong>{" "}
                                      {selectedLead.formData.phone}
                                    </p>
                                    <p>
                                      <strong>Service:</strong>{" "}
                                      {selectedLead.formData.eventType}
                                    </p>
                                    <p>
                                      <strong>Budget:</strong>{" "}
                                      {selectedLead.formData.budget}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    Lead Details
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Score:</strong>{" "}
                                      {selectedLead.score}/100
                                    </p>
                                    <p>
                                      <strong>Temperature:</strong>{" "}
                                      {selectedLead.temperature}
                                    </p>
                                    <p>
                                      <strong>Source:</strong>{" "}
                                      {selectedLead.source}
                                    </p>
                                    <p>
                                      <strong>Created:</strong>{" "}
                                      {format(
                                        new Date(selectedLead.createdAt),
                                        "PPP",
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Message</h3>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                  {selectedLead.formData.message}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="btn-bronze"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Convert
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Convert Lead to Client</DialogTitle>
                          </DialogHeader>
                          {selectedLead && (
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Convert{" "}
                                <strong>{selectedLead.formData.name}</strong>{" "}
                                from a lead to an active client.
                              </p>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {selectedLead.formData.email}
                                  </p>
                                  <p>
                                    <strong>Phone:</strong>{" "}
                                    {selectedLead.formData.phone}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Service Interest:</strong>{" "}
                                    {selectedLead.formData.eventType}
                                  </p>
                                  <p>
                                    <strong>Lead Score:</strong>{" "}
                                    {selectedLead.score}/100
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  className="btn-bronze"
                                  onClick={() => {
                                    toast({
                                      title: "Lead Converted",
                                      description: `${selectedLead.formData.name} has been converted to a client.`,
                                    });
                                    setSelectedLead(null);
                                  }}
                                >
                                  Convert to Client
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
