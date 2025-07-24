import React from "react";
import { Navigation } from "@/components/navigation";
import { BookingForm } from "@/components/booking-form";
import { AIChat } from "@/components/ai-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  Award, 
  CheckCircle, 
  Clock, 
  MapPin,
  Camera,
  Plane,
  Users
} from "lucide-react";

export default function Booking() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-cream to-background dark:from-background dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
              Book Your Photography Session
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Schedule your photography session with our intelligent booking system. Get instant availability, 
              AI-powered recommendations, and seamless contract management.
            </p>
            
            {/* Key Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Award className="h-4 w-4 mr-1" />
                FAA Certified Drone Operator
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                Fully Insured & Licensed
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Clock className="h-4 w-4 mr-1" />
                24/7 AI Booking Assistant
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Booking Form */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="font-playfair text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start">
                  <Calendar className="h-8 w-8 mr-3 text-bronze" />
                  Quick Booking
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below to book your photography session. Our system will check availability 
                  and provide instant confirmation.
                </p>
              </div>
              
              <BookingForm />
            </div>

            {/* AI Chat Assistant */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="font-playfair text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start">
                  <MessageSquare className="h-8 w-8 mr-3 text-teal" />
                  AI Booking Assistant
                </h2>
                <p className="text-muted-foreground">
                  Have questions? Chat with our AI assistant for instant help with packages, 
                  availability, pricing, and location recommendations.
                </p>
              </div>
              
              <AIChat />
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold mb-4">Why Choose CapturedCCollective?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional photography services with cutting-edge AI technology and FAA-certified drone operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Wedding Photography */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-pink-100 dark:bg-pink-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle>Wedding Photography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Capture your special day with romantic, cinematic photography across Hawaii's most beautiful locations.
                </p>
                <div className="text-2xl font-bold text-bronze mb-2">$2,500</div>
                <div className="text-sm text-muted-foreground">Starting price</div>
              </CardContent>
            </Card>

            {/* Portrait Sessions */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Portrait Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Professional portraits for personal branding, families, and special occasions with Hawaiian backdrops.
                </p>
                <div className="text-2xl font-bold text-bronze mb-2">$450</div>
                <div className="text-sm text-muted-foreground">Starting price</div>
              </CardContent>
            </Card>

            {/* Aerial Photography */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 relative">
              <CardHeader>
                <Badge className="absolute top-4 right-4 bg-bronze text-white">
                  <Award className="h-3 w-3 mr-1" />
                  FAA Certified
                </Badge>
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plane className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Aerial Photography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Licensed drone operations for stunning aerial perspectives of Hawaii's landscapes and events.
                </p>
                <div className="text-2xl font-bold text-bronze mb-2">$350</div>
                <div className="text-sm text-muted-foreground">Starting price</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold mb-4">Simple Booking Process</h2>
            <p className="text-muted-foreground">
              From initial consultation to final delivery, we've streamlined every step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-bronze text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold mb-2">Book Online</h3>
              <p className="text-sm text-muted-foreground">
                Use our booking form or chat with our AI assistant to schedule your session.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-bronze text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold mb-2">Consultation</h3>
              <p className="text-sm text-muted-foreground">
                We'll discuss your vision, location preferences, and any special requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-bronze text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold mb-2">Photo Session</h3>
              <p className="text-sm text-muted-foreground">
                Professional photography session with AI-assisted shot selection and drone coverage if selected.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-bronze text-white rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="font-bold mb-2">Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Receive your professionally edited photos through our secure online gallery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-playfair text-3xl font-bold mb-6">Need Help Booking?</h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Our team is here to help. Contact us directly for custom packages, special requirements, or any questions.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="bg-bronze rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-1">Book Online</h3>
                <p className="text-sm text-white/70">24/7 booking system</p>
              </div>
              
              <div className="text-center">
                <div className="bg-bronze rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-1">AI Assistant</h3>
                <p className="text-sm text-white/70">Instant chat support</p>
              </div>
              
              <div className="text-center">
                <div className="bg-bronze rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-1">Hawaii Based</h3>
                <p className="text-sm text-white/70">Local expertise</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
