import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Save,
  X,
  DollarSign,
  Clock,
  Camera,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  active: boolean;
  addOns?: Array<{ id: string; name: string; price: number }>;
  images?: string[];
}

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  active: boolean;
  addOns: Array<{ id: string; name: string; price: number }>;
}

export function ServiceManagement() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services (admin endpoint to get all services including inactive)
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services/admin"],
    queryFn: async () => {
      const response = await fetch("/api/services/admin");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceFormData) => {
      return await apiRequest("POST", "/api/services", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Service created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service.",
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      serviceData,
    }: {
      id: number;
      serviceData: Partial<ServiceFormData>;
    }) => {
      return await apiRequest("PATCH", `/api/services/${id}`, serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setEditingService(null);
      toast({
        title: "Success",
        description: "Service updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service.",
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    },
  });

  // Toggle service visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await apiRequest("PATCH", `/api/services/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service visibility updated.",
      });
    },
  });

  // Handle image selection
  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files);

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  // Service form component
  const ServiceForm = ({
    service,
    onSubmit,
    onCancel,
    isLoading: formLoading,
  }: {
    service?: Service;
    onSubmit: (data: ServiceFormData) => void;
    onCancel: () => void;
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState<ServiceFormData>({
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || "",
      duration: service?.duration || 60,
      category: service?.category || "photography",
      active: service?.active ?? true,
      addOns: service?.addOns || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Wedding Photography"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="e.g., wedding, portrait, commercial"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value),
                }))
              }
              placeholder="60"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Detailed description of the service..."
            rows={4}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="images">Service Images</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => {
                      const newFiles = selectedImages.filter(
                        (_, i) => i !== index,
                      );
                      const newUrls = imagePreviewUrls.filter(
                        (_, i) => i !== index,
                      );
                      setSelectedImages(newFiles);
                      setImagePreviewUrls(newUrls);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            <Save className="mr-2 h-4 w-4" />
            {formLoading
              ? "Saving..."
              : service
                ? "Update Service"
                : "Create Service"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">
            Manage your photography services, pricing, and images
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={(data) => createServiceMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createServiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: Service) => (
          <Card key={service.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? "Active" : "Hidden"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleVisibilityMutation.mutate({
                        id: service.id,
                        active: !service.active,
                      })
                    }
                  >
                    {service.active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {service.category}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />${service.price}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.duration}min
                </div>
              </div>

              {/* Service Images Preview */}
              {service.images && service.images.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {service.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${service.name} ${index + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                  ))}
                  {service.images.length > 4 && (
                    <div className="flex items-center justify-center bg-muted rounded border h-16">
                      <span className="text-xs text-muted-foreground">
                        +{service.images.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingService(service)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Service</DialogTitle>
                    </DialogHeader>
                    {editingService && (
                      <ServiceForm
                        service={editingService}
                        onSubmit={(data) =>
                          updateServiceMutation.mutate({
                            id: editingService.id,
                            serviceData: data,
                          })
                        }
                        onCancel={() => setEditingService(null)}
                        isLoading={updateServiceMutation.isPending}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this service?")
                    ) {
                      deleteServiceMutation.mutate(service.id);
                    }
                  }}
                  disabled={deleteServiceMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="p-12 text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first photography service to get started
          </p>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Service
              </Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      )}
    </div>
  );
}
