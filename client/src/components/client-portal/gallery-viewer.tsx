import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Heart,
  MessageSquare,
  Share2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryViewerProps {
  galleryId: string;
  clientId: string;
}

export function GalleryViewer({ galleryId, clientId }: GalleryViewerProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gallery data
  const { data: gallery, isLoading } = useQuery({
    queryKey: ["/api/client-portal/gallery", galleryId],
    queryFn: () =>
      fetch(`/api/client-portal/gallery/${galleryId}`).then((r) => r.json()),
  });

  // Fetch existing selections from real database
  const { data: selectionsData } = useQuery({
    queryKey: ["/api/client-portal/selections", galleryId],
    queryFn: async () => {
      const response = await fetch(
        `/api/client-portal/selections/${galleryId}?clientId=${clientId}`,
      );
      if (response.status === 404) {
        // No selections exist yet - return empty state
        return { favorites: [], comments: {} };
      }
      if (!response.ok) throw new Error("Failed to fetch selections");
      return response.json();
    },
  });

  // Update local state when selections data changes
  useEffect(() => {
    if (selectionsData?.favorites) {
      setFavorites(new Set(selectionsData.favorites));
    }
    if (selectionsData?.comments) {
      setComments(selectionsData.comments);
    }
  }, [selectionsData]);

  // Save selections mutation
  const saveSelectionsMutation = useMutation({
    mutationFn: async (data: {
      favorites: string[];
      comments: { [key: string]: string };
    }) => {
      const response = await fetch(
        `/api/client-portal/selections/${galleryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, ...data }),
        },
      );

      if (!response.ok) throw new Error("Failed to save selections");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Selections Saved",
        description: "Your photo selections have been saved successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/client-portal/selections", galleryId],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save selections. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = (imageId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
  };

  const updateComment = (imageId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [imageId]: comment }));
  };

  const handleSaveSelections = () => {
    saveSelectionsMutation.mutate({
      favorites: Array.from(favorites),
      comments: comments,
    });
  };

  const openLightbox = (image: any, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!gallery?.images) return;

    let newIndex = currentImageIndex;
    if (direction === "prev") {
      newIndex =
        currentImageIndex > 0
          ? currentImageIndex - 1
          : gallery.images.length - 1;
    } else {
      newIndex =
        currentImageIndex < gallery.images.length - 1
          ? currentImageIndex + 1
          : 0;
    }

    setCurrentImageIndex(newIndex);
    setSelectedImage(gallery.images[newIndex]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Gallery not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">{gallery.name}</h1>
          <p className="text-muted-foreground">
            {gallery.images?.length || 0} photos • Created{" "}
            {new Date(gallery.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            variant={gallery.status === "proofing" ? "default" : "secondary"}
          >
            {gallery.status === "proofing"
              ? "Select Your Favorites"
              : gallery.status}
          </Badge>

          {gallery.status === "proofing" && (
            <Button
              onClick={handleSaveSelections}
              disabled={saveSelectionsMutation.isPending}
              className="bg-bronze hover:bg-bronze/90"
            >
              {saveSelectionsMutation.isPending
                ? "Saving..."
                : `Save Selections (${favorites.size})`}
            </Button>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {gallery.status === "proofing" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">
                    {favorites.size} favorites selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">
                    {Object.keys(comments).filter((k) => comments[k]).length}{" "}
                    comments added
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Click the heart icon to mark photos as favorites
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.images?.map((image: any, index: number) => (
          <Card key={image.id} className="overflow-hidden group relative">
            <div className="aspect-square relative">
              <img
                src={image.thumbnailUrl || image.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => openLightbox(image, index)}
              />

              {/* Watermark overlay for proofing */}
              {gallery.status === "proofing" && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white/70 text-xs font-mono transform -rotate-45">
                    © Christian Picaso Photography • PROOF
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {gallery.status === "proofing" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`h-8 w-8 p-0 ${favorites.has(image.id) ? "bg-red-500 hover:bg-red-600" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(image.id) ? "text-white fill-current" : ""}`}
                    />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(image, index);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Favorite indicator */}
              {favorites.has(image.id) && (
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-red-500 text-white">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    Favorite
                  </Badge>
                </div>
              )}
            </div>

            {/* Comment section for proofing */}
            {gallery.status === "proofing" && (
              <CardContent className="p-3">
                <Textarea
                  placeholder="Add a comment about this photo..."
                  value={comments[image.id] || ""}
                  onChange={(e) => updateComment(image.id, e.target.value)}
                  className="text-xs min-h-[60px]"
                />
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-5xl h-[90vh] p-0"
          aria-describedby="lightbox-description"
        >
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold">
                  Photo {currentImageIndex + 1} of {gallery.images?.length}
                </h3>
                <div id="lightbox-description" className="sr-only">
                  Full size view of photo {currentImageIndex + 1} from{" "}
                  {gallery.name} gallery
                </div>
                {gallery.status === "proofing" && (
                  <Button
                    size="sm"
                    variant={
                      favorites.has(selectedImage?.id) ? "default" : "outline"
                    }
                    onClick={() =>
                      selectedImage && toggleFavorite(selectedImage.id)
                    }
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${favorites.has(selectedImage?.id) ? "fill-current" : ""}`}
                    />
                    {favorites.has(selectedImage?.id)
                      ? "Favorited"
                      : "Add to Favorites"}
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 relative bg-black">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={`Photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Navigation */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => navigateLightbox("prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => navigateLightbox("next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
