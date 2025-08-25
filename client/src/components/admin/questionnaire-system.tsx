import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  TrendingUp, 
  BarChart3,
  Eye,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email';
  question: string;
  required: boolean;
  options?: string[];
}

interface Questionnaire {
  id: string;
  name: string;
  description: string;
  serviceType: string;
  questions: Question[];
  active: boolean;
  responses: number;
  completionRate: number;
  avgTime: string;
  createdAt: string;
}

export function QuestionnaireSystem() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch questionnaires from real database
  const { data: questionnaires = [], isLoading } = useQuery({
    queryKey: ['/api/questionnaires'],
    queryFn: async () => {
      const response = await fetch('/api/questionnaires');
      if (!response.ok) throw new Error('Failed to fetch questionnaires');
      return response.json();
    }
  });

  // Fetch questionnaire responses
  const { data: responses = [] } = useQuery({
    queryKey: ['/api/questionnaire-responses'],
    queryFn: async () => {
      const response = await fetch('/api/questionnaire-responses');
      if (!response.ok) throw new Error('Failed to fetch responses');
      return response.json();
    }
  });

  // Create questionnaire mutation
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (questionnaireData: any) => {
      const response = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData),
      });
      if (!response.ok) throw new Error('Failed to create questionnaire');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Questionnaire created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
      setSelectedQuestionnaire(null);
      setQuestions([]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create questionnaire", variant: "destructive" });
    },
  });

  // Update questionnaire mutation
  const updateQuestionnaireMutation = useMutation({
    mutationFn: async ({ id, ...questionnaireData }: any) => {
      const response = await fetch(`/api/questionnaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData),
      });
      if (!response.ok) throw new Error('Failed to update questionnaire');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Questionnaire updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
      setSelectedQuestionnaire(null);
      setQuestions([]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update questionnaire", variant: "destructive" });
    },
  });

  // Delete questionnaire mutation
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/questionnaires/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete questionnaire');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Questionnaire deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaires'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete questionnaire", variant: "destructive" });
    },
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'text',
      question: '',
      required: false,
      options: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    const questionnaireData = {
      name: formData.get('name'),
      description: formData.get('description'),
      serviceType: formData.get('serviceType'),
      questions: questions,
      active: formData.get('active') === 'true',
    };

    if (selectedQuestionnaire) {
      updateQuestionnaireMutation.mutate({ id: selectedQuestionnaire.id, ...questionnaireData });
    } else {
      createQuestionnaireMutation.mutate(questionnaireData);
    }
  };

  const openEditDialog = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setQuestions(questionnaire.questions);
  };

  const resetForm = () => {
    setSelectedQuestionnaire(null);
    setQuestions([]);
  };

  // Calculate real metrics
  const totalQuestionnaires = questionnaires.length;
  const activeQuestionnaires = questionnaires.filter((q: any) => q.active).length;
  const totalResponses = questionnaires.reduce((sum: number, q: any) => sum + (q.responses || 0), 0);
  const averageCompletion = questionnaires.length > 0 
    ? questionnaires.reduce((sum: number, q: any) => sum + (q.completionRate || 0), 0) / questionnaires.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Questionnaire System</h1>
          <p className="text-muted-foreground">Create and manage client questionnaires</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-bronze hover:bg-bronze/90" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Questionnaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedQuestionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Questionnaire Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={selectedQuestionnaire?.name}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select name="serviceType" defaultValue={selectedQuestionnaire?.serviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    defaultValue={selectedQuestionnaire?.description}
                  />
                </div>
                <div>
                  <Label htmlFor="active">Status</Label>
                  <Select name="active" defaultValue={selectedQuestionnaire?.active ? "true" : "false"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="Enter your question"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={question.type} 
                            onValueChange={(value) => updateQuestion(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Input</SelectItem>
                              <SelectItem value="textarea">Long Text</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="radio">Radio Buttons</SelectItem>
                              <SelectItem value="checkbox">Checkboxes</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                          <div className="col-span-2">
                            <Label>Options (one per line)</Label>
                            <Textarea
                              value={question.options?.join('\n') || ''}
                              onChange={(e) => updateQuestion(index, 'options', e.target.value.split('\n').filter(Boolean))}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}

                        <div className="col-span-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={question.required}
                              onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                            />
                            <Label>Required</Label>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="submit" 
                  disabled={createQuestionnaireMutation.isPending || updateQuestionnaireMutation.isPending}
                >
                  {selectedQuestionnaire ? 'Update Questionnaire' : 'Create Questionnaire'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questionnaires</p>
                <p className="text-3xl font-bold">{totalQuestionnaires}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Questionnaires</p>
                <p className="text-3xl font-bold">{activeQuestionnaires}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-3xl font-bold">{totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-3xl font-bold">{averageCompletion.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="questionnaires" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="questionnaires" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionnaires.length > 0 ? (
                    questionnaires.map((questionnaire: any) => (
                      <TableRow key={questionnaire.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{questionnaire.name}</p>
                            <p className="text-sm text-muted-foreground">{questionnaire.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {questionnaire.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell>{questionnaire.questions?.length || 0}</TableCell>
                        <TableCell>{questionnaire.responses || 0}</TableCell>
                        <TableCell>{questionnaire.completionRate || 0}%</TableCell>
                        <TableCell>
                          <Badge variant={questionnaire.active ? "default" : "secondary"}>
                            {questionnaire.active ? "Active" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(questionnaire)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteQuestionnaireMutation.mutate(questionnaire.id)}
                              disabled={deleteQuestionnaireMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No questionnaires created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                <div className="text-center py-8 text-muted-foreground">
                  Response management feature requires additional implementation.
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No responses collected yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics feature requires additional implementation.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}