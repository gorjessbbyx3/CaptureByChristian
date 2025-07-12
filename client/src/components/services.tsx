import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Award, Brain, Palette, MessageSquare } from "lucide-react";
import { Link } from "wouter";

// Service features mapping for display
const serviceFeatures: Record<string, string[]> = {
  'wedding': ["8 hours of coverage", "500+ professionally edited photos", "FAA-certified drone photography", "Online gallery with download rights", "Print release for all images", "Backup photographer available", "Weather contingency planning"],
  'portrait': ["1-2 hours of shooting", "50+ professionally edited photos", "Multiple outfit changes", "Location scouting included", "Styling consultation", "Online gallery access", "Print release included"],
  'aerial': ["FAA Part 107 certified pilot", "4K video and high-resolution stills", "Legal airspace navigation", "Commercial insurance coverage", "Weather backup scheduling", "Raw file delivery option"],
  'event': ["Professional event coverage", "Candid and posed photography", "Same-day preview images", "Online gallery within 48 hours", "Group photo coordination", "Low-light expertise"],
  'real_estate': ["Interior and exterior shots", "HDR processing for optimal lighting", "Drone aerial views (where permitted)", "Virtual tour compatibility", "MLS-ready sizing", "24-hour delivery"]
};

const serviceImages: Record<string, string> = {
  'wedding': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'portrait': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'aerial': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'event': 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
  'real_estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
};

export function Services() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: fetchServices,
  });

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Services & Packages</h2>
            <p className="text-xl text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Services & Packages</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional photography services tailored to capture your unique story
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service: any) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={serviceImages[service.category] || serviceImages['portrait']}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                {service.category === 'aerial' && (
                  <Badge className="absolute top-4 left-4 bg-bronze text-white">
                    <Award className="h-3 w-3 mr-1" />
                    FAA Certified
                  </Badge>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="font-playfair text-2xl">{service.name}</CardTitle>
                <p className="text-muted-foreground">{service.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {serviceFeatures[service.category]?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-bronze mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <span className="text-3xl font-bold text-bronze">
                  ${parseInt(service.price).toLocaleString()}
                </span>
                <Link href="/booking">
                  <Button className="btn-bronze">
                    Book Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Professional Features Banner */}
        <div className="mt-16 bg-gradient-to-r from-teal via-bronze to-teal rounded-xl p-8 text-white text-center">
          <h3 className="font-playfair text-3xl font-bold mb-4">Professional Photography Experience</h3>
          <p className="text-xl mb-6">
            Expert photography services with professional editing, client portals, and comprehensive gallery management
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-3" />
              <h4 className="font-bold">Smart Photo Selection</h4>
              <p className="text-sm opacity-90">AI helps identify your best shots</p>
            </div>
            <div className="text-center">
              <Palette className="h-12 w-12 mx-auto mb-3" />
              <h4 className="font-bold">Auto Gallery Creation</h4>
              <p className="text-sm opacity-90">Organized by theme and style</p>
            </div>
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3" />
              <h4 className="font-bold">24/7 Booking Assistant</h4>
              <p className="text-sm opacity-90">AI chat for instant responses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
