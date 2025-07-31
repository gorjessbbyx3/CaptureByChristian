import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye,
  Copy,
  Settings,
  Users,
  Calendar,
  Camera,
  Heart,
  Building,
  Home,
  Zap,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

export function QuestionnaireSystem() {
  const [newQuestionnaireOpen, setNewQuestionnaireOpen] = useState(false);
  const [questionnaireBuilder, setQuestionnaireBuilder] = useState(false);

  // Questionnaire system requires database implementation
  const questionnaires = [
    {
      id: 1,
      name: "Wedding Photography Questionnaire",
      description: "Comprehensive pre-wedding consultation form",
      serviceType: "wedding",
      questions: [
        {
          id: "wedding_date",
          type: "date",
          question: "What is your wedding date?",
          required: true
        },
        {
          id: "venue_name",
          type: "text", 
          question: "Wedding venue name and address",
          required: true
        },
        {
          id: "guest_count",
          type: "select",
          question: "Approximate number of guests",
          required: true,
          options: ["Under 50", "50-100", "100-150", "150-200", "200+"]
        },
        {
          id: "ceremony_time",
          type: "text",
          question: "Ceremony start time",
          required: true
        },
        {
          id: "photography_style",
          type: "multiselect",
          question: "Preferred photography style",
          required: false,
          options: ["Traditional", "Photojournalistic", "Fine Art", "Modern", "Vintage"]
        },
        {
          id: "must_have_shots",
          type: "textarea",
          question: "Must-have shots or special requests",
          required: false
        },
        {
          id: "family_dynamics",
          type: "textarea",
          question: "Any family dynamics or sensitivities we should know about?",
          required: false
        },
        {
          id: "drone_coverage",
          type: "select",
          question: "Would you like drone coverage of the venue?",
          required: false,
          options: ["Yes, definitely", "Maybe, tell me more", "No thanks"]
        }
      ],
      active: true,
      responses: 23,
      completionRate: 89,
      avgTime: "8 minutes",
      createdAt: "2025-06-01T10:00:00Z"
    },
    {
      id: 2,
      name: "Portrait Session Preferences",
      description: "Individual, couple, and family portrait consultation",
      serviceType: "portrait", 
      questions: [
        {
          id: "session_purpose",
          type: "select",
          question: "What is the purpose of this session?",
          required: true,
          options: ["Family photos", "Couple photos", "Individual portraits", "Maternity", "Engagement", "Professional headshots"]
        },
        {
          id: "group_size",
          type: "text",
          question: "How many people will be in the photos?",
          required: true
        },
        {
          id: "location_preference",
          type: "multiselect",
          question: "Preferred location types",
          required: false,
          options: ["Beach", "Urban/City", "Nature/Park", "Home/Indoor", "Studio", "Unique Hawaii Location"]
        },
        {
          id: "style_inspiration",
          type: "textarea",
          question: "Any inspiration photos or style preferences?",
          required: false
        },
        {
          id: "wardrobe_guidance",
          type: "select",
          question: "Would you like wardrobe styling advice?",
          required: false,
          options: ["Yes, please!", "Just basic tips", "No, we're all set"]
        },
        {
          id: "children_ages",
          type: "text",
          question: "If including children, what are their ages?",
          required: false
        }
      ],
      active: true,
      responses: 34,
      completionRate: 94,
      avgTime: "5 minutes",
      createdAt: "2025-05-15T14:30:00Z"
    },
    {
      id: 3,
      name: "Corporate Event Photography Brief",
      description: "Business event and corporate photography requirements",
      serviceType: "corporate",
      questions: [
        {
          id: "event_type",
          type: "select",
          question: "Type of corporate event",
          required: true,
          options: ["Conference", "Product Launch", "Team Building", "Awards Ceremony", "Company Party", "Headshots", "Other"]
        },
        {
          id: "company_name",
          type: "text",
          question: "Company name",
          required: true
        },
        {
          id: "event_duration",
          type: "text",
          question: "Event duration (hours)",
          required: true
        },
        {
          id: "key_moments",
          type: "textarea",
          question: "Key moments or speakers to capture",
          required: true
        },
        {
          id: "branding_requirements",
          type: "textarea",
          question: "Brand guidelines or photo requirements",
          required: false
        },
        {
          id: "delivery_timeline",
          type: "select",
          question: "Photo delivery timeline needed",
          required: true,
          options: ["Same day", "24 hours", "48 hours", "1 week", "Flexible"]
        }
      ],
      active: true,
      responses: 12,
      completionRate: 83,
      avgTime: "6 minutes", 
      createdAt: "2025-04-20T09:15:00Z"
    },
    {
      id: 4,
      name: "Real Estate Photography Requirements",
      description: "Property photography specifications and requirements",
      serviceType: "real_estate",
      questions: [
        {
          id: "property_type",
          type: "select",
          question: "Property type",
          required: true,
          options: ["Single Family Home", "Condo/Townhouse", "Commercial Property", "Vacation Rental", "Land/Development"]
        },
        {
          id: "property_size",
          type: "text",
          question: "Approximate square footage",
          required: false
        },
        {
          id: "special_features",
          type: "multiselect",
          question: "Special features to highlight",
          required: false,
          options: ["Ocean View", "Mountain View", "Pool", "Large Yard", "Updated Kitchen", "Home Theater", "Wine Cellar", "Garage"]
        },
        {
          id: "drone_required",
          type: "select",
          question: "Drone photography needed?",
          required: true,
          options: ["Yes, essential", "Yes, if weather permits", "No"]
        },
        {
          id: "listing_timeline",
          type: "select",
          question: "When does the property go on market?",
          required: true,
          options: ["This week", "Next week", "Within a month", "Flexible"]
        },
        {
          id: "virtual_tour",
          type: "select",
          question: "Interest in virtual tour add-on?",
          required: false,
          options: ["Very interested", "Maybe", "Not needed"]
        }
      ],
      active: true,
      responses: 18,
      completionRate: 91,
      avgTime: "4 minutes",
      createdAt: "2025-05-01T16:45:00Z"
    },
    {
      id: 5,
      name: "Adventure/Lifestyle Session Planning",
      description: "Active lifestyle and adventure photography preparation",
      serviceType: "adventure",
      questions: [
        {
          id: "activity_type",
          type: "multiselect",
          question: "Activities to capture",
          required: true,
          options: ["Surfing", "Hiking", "Yoga", "Rock Climbing", "Biking", "Running", "Beach Activities", "Water Sports"]
        },
        {
          id: "experience_level",
          type: "select",
          question: "Your experience level with this activity",
          required: false,
          options: ["Beginner", "Intermediate", "Advanced", "Professional"]
        },
        {
          id: "safety_considerations",
          type: "textarea",
          question: "Any safety considerations or physical limitations?",
          required: false
        },
        {
          id: "gear_provided",
          type: "select",
          question: "Do you have your own gear/equipment?",
          required: false,
          options: ["Yes, everything", "Some items", "Need to rent", "Not sure"]
        },
        {
          id: "action_preference",
          type: "select",
          question: "Photo style preference",
          required: false,
          options: ["Action shots", "Lifestyle/posed", "Mix of both", "Candid moments"]
        }
      ],
      active: true,
      responses: 8,
      completionRate: 75,
      avgTime: "7 minutes",
      createdAt: "2025-03-10T11:30:00Z"
    }
  ];

  // Fetch real questionnaire responses from database
  const { data: responses = [] } = useQuery({
    queryKey: ['/api/questionnaire-responses'],
    queryFn: async () => {
      const response = await fetch('/api/questionnaire-responses');
      if (!response.ok) throw new Error('Failed to fetch questionnaire responses');
      return response.json();
    }
  });

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "wedding": return <Heart className="h-4 w-4" />;
      case "portrait": return <Users className="h-4 w-4" />;
      case "corporate": return <Building className="h-4 w-4" />;
      case "real_estate": return <Home className="h-4 w-4" />;
      case "adventure": return <Zap className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "text": return "📝";
      case "textarea": return "📄"; 
      case "select": return "📋";
      case "multiselect": return "☑️";
      case "date": return "📅";
      case "file": return "📎";
      default: return "❓";
    }
  };

  const questionnaireStats = {
    total: questionnaires.length,
    active: questionnaires.filter(q => q.active).length,
    totalResponses: questionnaires.reduce((sum, q) => sum + q.responses, 0),
    avgCompletion: Math.round(questionnaires.reduce((sum, q) => sum + q.completionRate, 0) / questionnaires.length)
  };

  return (
    <div className="space-y-6">
      {/* Questionnaire Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">{questionnaireStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{questionnaireStats.active}</p>
                <p className="text-xs text-muted-foreground">Active Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{questionnaireStats.totalResponses}</p>
                <p className="text-xs text-muted-foreground">Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{questionnaireStats.avgCompletion}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questionnaire Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Questionnaire Templates
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setQuestionnaireBuilder(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Builder
              </Button>
              <Button className="btn-bronze" onClick={() => setNewQuestionnaireOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaires.map((questionnaire) => (
              <div key={questionnaire.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-bronze">
                        {getServiceIcon(questionnaire.serviceType)}
                      </div>
                      <h3 className="font-semibold">{questionnaire.name}</h3>
                      <Badge variant={questionnaire.active ? "default" : "secondary"}>
                        {questionnaire.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {questionnaire.serviceType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{questionnaire.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Questions</p>
                        <p className="font-medium">{questionnaire.questions.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responses</p>
                        <p className="font-medium">{questionnaire.responses}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion Rate</p>
                        <p className="font-medium">{questionnaire.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">{questionnaire.avgTime}</p>
                      </div>
                    </div>

                    {/* Question Preview */}
                    <div>
                      <p className="text-sm font-medium mb-2">Questions Preview:</p>
                      <div className="flex flex-wrap gap-2">
                        {questionnaire.questions.slice(0, 5).map((question, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getQuestionIcon(question.type)} {question.question.substring(0, 30)}...
                          </Badge>
                        ))}
                        {questionnaire.questions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{questionnaire.questions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Form Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responses.map((response: { id: number; questionnaireId: number; clientName: string; completedAt: string; bookingDate: string; responses: Record<string, string | string[]> }) => {
              const questionnaire = questionnaires.find(q => q.id === response.questionnaireId);
              return (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{response.clientName}</h3>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{questionnaire?.name}</span>
                        <Badge variant="outline">
                          {format(new Date(response.completedAt), "MMM d, yyyy")}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Session Date:</strong> {format(new Date(response.bookingDate), "MMMM d, yyyy")}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        {Object.entries(response.responses).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="text-muted-foreground w-32 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="flex-1">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(response.responses).length > 3 && (
                          <div className="text-bronze text-sm">
                            +{Object.keys(response.responses).length - 3} more responses
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Full
                      </Button>
                      <Button size="sm" className="btn-bronze">
                        <Calendar className="h-3 w-3 mr-1" />
                        Plan Session
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create New Questionnaire Dialog */}
      <Dialog open={newQuestionnaireOpen} onOpenChange={setNewQuestionnaireOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Questionnaire</DialogTitle>
            <DialogDescription>
              Create custom questionnaires for different photography services and client types.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Questionnaire Name</label>
                <Input placeholder="e.g., Wedding Photography Consultation" />
              </div>
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe what this questionnaire covers..." />
            </div>
            <div className="flex items-center space-x-2">
              <Switch />
              <label className="text-sm">Active immediately</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewQuestionnaireOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-bronze">
                Create & Add Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Questionnaire Builder Modal */}
      <Dialog open={questionnaireBuilder} onOpenChange={setQuestionnaireBuilder}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Questionnaire Builder</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Advanced Form Builder</h3>
            <p className="text-muted-foreground mb-6">
              Drag-and-drop question builder with conditional logic, file uploads, and smart validation
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-bronze" />
                <h4 className="font-medium">Question Types</h4>
                <p className="text-sm text-muted-foreground">Text, date, select, multi-select, file upload</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-bronze" />
                <h4 className="font-medium">Smart Logic</h4>
                <p className="text-sm text-muted-foreground">Conditional questions based on answers</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-bronze" />
                <h4 className="font-medium">Analytics</h4>
                <p className="text-sm text-muted-foreground">Response tracking and insights</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}