import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expand, Star } from "lucide-react";
import { Lightbox } from "@/components/lightbox";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export function FeaturedGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<{url: string, title: string, category: string} | null>(null);

  const { data: featuredImages, isLoading } = useQuery({
    queryKey: ['/api/gallery', { featured: true }],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gallery?featured=true');
      return response.json();
    },
  });

  const openLightbox = (image: any) => {
    setCurrentImage({
      url: image.url,
      title: image.originalName || image.filename,
      category: image.category
    });
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <section id="portfolio" className="py-20 bg-cream dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Featured Work</h2>
            <p className="text-xl text-muted-foreground">Loading featured images...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-cream dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-charcoal via-bronze to-charcoal bg-clip-text text-transparent">
            Showcasing Excellence
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A curated selection of our finest work showcasing the artistry and technical excellence of Hawaii's premier photography services.
          </p>
        </div>

        {/* Featured Images Grid */}
        {featuredImages && featuredImages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {featuredImages.map((image: any, index: number) => (
                <div
                  key={image.id || index}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-muted cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                  onClick={() => openLightbox(image)}
                >
                  <img
                    src={image.url}
                    alt={image.originalName || image.filename || 'Featured image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold text-lg">
                            {image.originalName || image.filename || 'Featured Work'}
                          </h4>
                          {image.category && (
                            <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
                              {image.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Expand className="h-5 w-5 text-white" />
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Full Portfolio CTA */}
            <div className="text-center">
              <Link href="/portfolio">
                <Button size="lg" className="btn-bronze group">
                  View Complete Portfolio
                  <Expand className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Featured Images Yet</h3>
            <p className="text-muted-foreground mb-6">
              Our featured gallery will showcase the best work once images are marked as featured.
            </p>
            <Link href="/portfolio">
              <Button variant="outline">
                Browse All Work
              </Button>
            </Link>
          </div>
        )}

        {/* Lightbox */}
        {currentImage && (
          <Lightbox
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            image={currentImage}
          />
        )}
      </div>
    </section>
  );
}