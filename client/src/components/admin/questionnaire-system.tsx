
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  responseCount: number;
}

interface QuestionnaireResponse {
  id: number;
  questionnaireId: number;
  questionnaireName: string;
  clientName: string;
  clientEmail: string;
  responses: Record<string, any>;
  status: 'incomplete' | 'completed';
  submittedAt: string;
}

export function QuestionnaireSystem() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireDialogOpen, setQuestionnaireDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    title: '',
    description: '',
    questions: [] as Question[]
  });
  const [newQuestion, setNewQuestion] = useState({
    type: 'text' as Question['type'],
    question: '',
    options: [''],
    required: false
  });
  const queryClient = useQueryClient();

  // Fetch questionnaires
  const { data: questionnaires = [], isLoading: isLoadingQuestionnaires } = useQuery({
    queryKey: ['/api/questionnaires'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/questionnaires');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch questionnaires:', error);
        return [];
      }
    },
  });

  // Fetch responses
  const { data: responses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ['/api/questionnaire-responses'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/questionnaire-responses');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch responses:', error);
        return [];
      }
    },
  });

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalQuestionnaires = questionnaires.length;
    const activeQuestionnaires = questionnaires.filter((q: Questionnaire) => q.status === 'active').length;
    const totalResponses = responses.length;
    const completedResponses = responses.filter((r: QuestionnaireResponse) => r.status === 'completed').length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    return {
      totalQuestionnaires,
      activeQuestionnaires,
      totalResponses,
      completedResponses,
      completionRate
    };
  }, [questionnaires, responses]);

  // Create questionnaire mutation
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (questionnaireData: typeof newQuestionnaire) => {
      const response = await apiRequest('POST', '/api/questionnaires', questionnaireData);
      if (!response.ok) {
        throw new Error('Failed to create questionnaire');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
      setQuestionnaireDialogOpen(false);
      setNewQuestionnaire({ title: '', description: '', questions: [] });
    },
  });

  // Delete questionnaire mutation
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: async (questionnaireId: number) => {
      const response = await apiRequest('DELETE', `/api/questionnaires/${questionnaireId}`);
      if (!response.ok) {
        throw new Error('Failed to delete questionnaire');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
    },
  });

  const addQuestion = () => {
    if (!newQuestion.question.trim()) return;

    const question: Question = {
      id: Date.now().toString(),
      type: newQuestion.type,
      question: newQuestion.question,
      options: newQuestion.type === 'select' || newQuestion.type === 'multiselect' || newQuestion.type === 'radio' 
        ? newQuestion.options.filter(opt => opt.trim()) 
        : undefined,
      required: newQuestion.required,
      order: newQuestionnaire.questions.length + 1
    };

    setNewQuestionnaire({
      ...newQuestionnaire,
      questions: [...newQuestionnaire.questions, question]
    });

    setNewQuestion({
      type: 'text',
      question: '',
      options: [''],
      required: false
    });
  };

  const removeQuestion = (questionId: string) => {
    setNewQuestionnaire({
      ...newQuestionnaire,
      questions: newQuestionnaire.questions.filter(q => q.id !== questionId)
    });
  };

  const handleCreateQuestionnaire = () => {
    if (!newQuestionnaire.title || newQuestionnaire.questions.length === 0) {
      return;
    }
    createQuestionnaireMutation.mutate(newQuestionnaire);
  };

  if (isLoadingQuestionnaires || isLoadingResponses) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading questionnaire data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalQuestionnaires}</p>
                <p className="text-xs text-muted-foreground">Total Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.activeQuestionnaires}</p>
                <p className="text-xs text-muted-foreground">Active Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
                <p className="text-xs text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.completedResponses}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questionnaires" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="questionnaires" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Client Questionnaires
                </span>
                <Dialog open={questionnaireDialogOpen} onOpenChange={setQuestionnaireDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-bronze">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Questionnaire
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Questionnaire</DialogTitle>
                      <DialogDescription>
                        Build a custom questionnaire to gather information from your clients.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={newQuestionnaire.title}
                            onChange={(e) => setNewQuestionnaire({ ...newQuestionnaire, title: e.target.value })}
                            placeholder="e.g., Wedding Photography Questionnaire"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newQuestionnaire.description}
                            onChange={(e) => setNewQuestionnaire({ ...newQuestionnaire, description: e.target.value })}
                            placeholder="Brief description of what this questionnaire is for..."
                          />
                        </div>
                      </div>

                      {/* Questions */}
                      <div>
                        <h4 className="font-medium mb-4">Questions ({newQuestionnaire.questions.length})</h4>
                        
                        {/* Existing Questions */}
                        {newQuestionnaire.questions.map((question, index) => (
                          <div key={question.id} className="border rounded-lg p-4 mb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium">Q{index + 1}</span>
                                  <Badge variant="outline">{question.type}</Badge>
                                  {question.required && <Badge variant="secondary">Required</Badge>}
                                </div>
                                <p className="font-medium">{question.question}</p>
                                {question.options && (
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">Options:</p>
                                    <ul className="text-sm text-muted-foreground ml-4">
                                      {question.options.map((option, i) => (
                                        <li key={i}>• {option}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeQuestion(question.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add New Question */}
                        <div className="border-2 border-dashed rounded-lg p-4">
                          <h5 className="font-medium mb-3">Add New Question</h5>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium">Question Type</label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={newQuestion.type}
                                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
                                >
                                  <option value="text">Short Text</option>
                                  <option value="textarea">Long Text</option>
                                  <option value="select">Dropdown</option>
                                  <option value="radio">Radio Buttons</option>
                                  <option value="checkbox">Checkboxes</option>
                                </select>
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <input
                                  type="checkbox"
                                  checked={newQuestion.required}
                                  onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                                />
                                <label className="text-sm">Required</label>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Question</label>
                              <Input
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                placeholder="Enter your question..."
                              />
                            </div>

                            {(newQuestion.type === 'select' || newQuestion.type === 'radio' || newQuestion.type === 'checkbox') && (
                              <div>
                                <label className="text-sm font-medium">Options</label>
                                {newQuestion.options.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2 mt-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const updatedOptions = [...newQuestion.options];
                                        updatedOptions[index] = e.target.value;
                                        setNewQuestion({ ...newQuestion, options: updatedOptions });
                                      }}
                                      placeholder={`Option ${index + 1}`}
                                    />
                                    {index === newQuestion.options.length - 1 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] })}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <Button onClick={addQuestion} variant="outline" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Question
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setQuestionnaireDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateQuestionnaire}
                          disabled={createQuestionnaireMutation.isPending || !newQuestionnaire.title || newQuestionnaire.questions.length === 0}
                          className="btn-bronze"
                        >
                          {createQuestionnaireMutation.isPending ? 'Creating...' : 'Create Questionnaire'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questionnaires.length > 0 ? (
                <div className="space-y-4">
                  {questionnaires.map((questionnaire: Questionnaire) => (
                    <div key={questionnaire.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{questionnaire.title}</h3>
                            <Badge variant={questionnaire.status === 'active' ? 'default' : questionnaire.status === 'draft' ? 'secondary' : 'outline'}>
                              {questionnaire.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{questionnaire.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{questionnaire.questions.length} questions</span>
                            <span>{questionnaire.responseCount} responses</span>
                            <span>Created {format(new Date(questionnaire.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteQuestionnaireMutation.mutate(questionnaire.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No questionnaires created yet.</p>
                  <p className="text-sm text-muted-foreground">Create your first questionnaire to start gathering client information!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {responses.length > 0 ? (
                <div className="space-y-4">
                  {responses.map((response: QuestionnaireResponse) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{response.questionnaireName}</h3>
                            <Badge variant={response.status === 'completed' ? 'default' : 'secondary'}>
                              {response.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Client:</strong> {response.clientName} ({response.clientEmail})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Submitted:</strong> {format(new Date(response.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No responses collected yet.</p>
                  <p className="text-sm text-muted-foreground">Responses will appear here once clients start filling out questionnaires.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Questionnaires</span>
                    <span className="font-semibold">{analytics.totalQuestionnaires}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Questionnaires</span>
                    <span className="font-semibold">{analytics.activeQuestionnaires}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Responses</span>
                    <span className="font-semibold">{analytics.totalResponses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Responses</span>
                    <span className="font-semibold">{analytics.completedResponses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-semibold">{analytics.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {analytics.totalResponses > 0 ? (
                    <p>Question analytics will be displayed here based on response data.</p>
                  ) : (
                    <p>No response data available for analysis yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Details Modal */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Response Details - {selectedResponse?.questionnaireName}
            </DialogTitle>
            <DialogDescription>
              View detailed response from {selectedResponse?.clientName}
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedResponse.clientName}</p>
                    <p><strong>Email:</strong> {selectedResponse.clientEmail}</p>
                    <p><strong>Status:</strong> <Badge variant={selectedResponse.status === 'completed' ? 'default' : 'secondary'}>{selectedResponse.status}</Badge></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Submission Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Submitted:</strong> {format(new Date(selectedResponse.submittedAt), "PPP 'at' p")}</p>
                    <p><strong>Questions Answered:</strong> {Object.keys(selectedResponse.responses).length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Responses</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(selectedResponse.responses).map(([questionId, answer]) => (
                    <div key={questionId} className="border rounded p-3">
                      <p className="font-medium text-sm mb-1">Question {questionId}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                      </p>
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
