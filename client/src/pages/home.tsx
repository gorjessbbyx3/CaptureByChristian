import React from "react";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { Portfolio } from "@/components/portfolio";
import { Services } from "@/components/services";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Award, 
  Shield, 
  Brain, 
  Phone, 
  Mail, 
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Camera
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  // Fetch profile data for dynamic content
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Portfolio Section */}
      <Portfolio />
      
      {/* Services Section */}
      <Services />
      
      {/* Enhanced Booking CTA Section */}
      <section id="booking" className="py-24 bg-gradient-to-br from-cream via-white to-cream/80 dark:from-background dark:via-background dark:to-background/80 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-bronze to-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-teal to-bronze rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-r from-bronze to-teal rounded-full p-1">
                <div className="bg-white dark:bg-background rounded-full px-6 py-2">
                  <span className="text-sm font-medium bg-gradient-to-r from-bronze to-teal bg-clip-text text-transparent">
                    Ready to Get Started?
                  </span>
                </div>
              </div>
            </div>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-charcoal via-bronze to-charcoal bg-clip-text text-transparent">
              Ready to Capture Your Story?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Let's create something beautiful together. Choose your preferred way to get started with 
              <span className="text-bronze font-medium"> professional photography services</span>.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Enhanced Quick Booking Card */}
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-cream/50 dark:from-background dark:to-background/50">
              <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-10 relative z-10">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-bronze to-bronze/80 rounded-2xl p-6 w-24 h-24 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Camera className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="font-playfair text-3xl font-bold mb-6 text-charcoal dark:text-white">Book Your Session</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Complete booking system with calendar integration, contract management, and secure payment processing. Professional workflow from start to finish.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-bronze rounded-full mr-3"></div>
                      Instant availability check
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-bronze rounded-full mr-3"></div>
                      Digital contract signing
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-bronze rounded-full mr-3"></div>
                      Secure payment gateway
                    </div>
                  </div>
                  <Link href="/booking">
                    <Button size="lg" className="btn-bronze w-full py-4 text-lg font-medium group-hover:shadow-lg transition-all duration-300">
                      Start Booking Process
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced AI Assistant Card */}
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-teal/5 dark:from-background dark:to-background/50">
              <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-10 relative z-10">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-teal to-teal/80 rounded-2xl p-6 w-24 h-24 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Brain className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="font-playfair text-3xl font-bold mb-6 text-charcoal dark:text-white">AI Booking Assistant</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    24/7 intelligent chat assistant powered by advanced AI. Get instant answers, availability checks, and custom quotes tailored to your needs.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-teal rounded-full mr-3"></div>
                      Instant responses 24/7
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-teal rounded-full mr-3"></div>
                      Smart recommendation engine
                    </div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-teal rounded-full mr-3"></div>
                      Custom quote generation
                    </div>
                  </div>
                  <Link href="/booking">
                    <Button size="lg" variant="outline" className="border-2 border-teal text-teal hover:bg-teal hover:text-white w-full py-4 text-lg font-medium transition-all duration-300">
                      Chat with AI Assistant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center space-x-8 bg-white/80 dark:bg-background/80 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground">SSL Secured</span>
              </div>
              <div className="w-px h-4 bg-muted-foreground/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground">GDPR Compliant</span>
              </div>
              <div className="w-px h-4 bg-muted-foreground/30"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-bronze rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground">Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-muted/20 to-cream/30 dark:from-muted/10 dark:to-background/50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-bronze/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-teal/8 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <div className="inline-block bg-gradient-to-r from-bronze to-teal rounded-full p-1 mb-6">
                  <div className="bg-white dark:bg-background rounded-full px-4 py-2">
                    <span className="text-sm font-medium bg-gradient-to-r from-bronze to-teal bg-clip-text text-transparent">
                      Meet the Artist
                    </span>
                  </div>
                </div>
                <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-charcoal via-bronze to-charcoal bg-clip-text text-transparent">
                  About {profile?.name?.split(' ')[0] || 'Christian'}
                </h2>
              </div>
              
              <div className="space-y-6 mb-10">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {profile?.bio || "Born and raised in Hawaii, Christian has spent over a decade mastering the art of photography across the Hawaiian Islands. His passion for capturing life's most precious moments stems from a deep connection to the islands' natural beauty and cultural richness."}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  As an FAA-certified drone pilot and AI-enhanced photographer, {profile?.name?.split(' ')[0] || 'Christian'} brings both traditional artistry and cutting-edge technology to every shoot. His work has been featured in Pacific Weddings, Hawaii Magazine, and has garnered international recognition across social media platforms worldwide.
                </p>
              </div>
              
              {/* Enhanced Certifications Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="group bg-gradient-to-br from-white to-bronze/5 dark:from-background dark:to-bronze/10 rounded-xl p-6 border border-bronze/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-bronze to-bronze/80 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-charcoal dark:text-white">FAA Part 107 Certified</div>
                      <div className="text-sm text-muted-foreground">Licensed Drone Operator</div>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 font-medium">Active License</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-white to-bronze/5 dark:from-background dark:to-bronze/10 rounded-xl p-6 border border-bronze/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-bronze to-bronze/80 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-charcoal dark:text-white">Professional Photographer</div>
                      <div className="text-sm text-muted-foreground">10+ Years Experience</div>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 bg-bronze rounded-full mr-2"></div>
                        <span className="text-xs text-bronze font-medium">Expert Level</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-white to-teal/5 dark:from-background dark:to-teal/10 rounded-xl p-6 border border-teal/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-teal to-teal/80 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-charcoal dark:text-white">Fully Insured</div>
                      <div className="text-sm text-muted-foreground">Equipment & Liability</div>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-600 font-medium">$2M Coverage</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-white to-teal/5 dark:from-background dark:to-teal/10 rounded-xl p-6 border border-teal/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-teal to-teal/80 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-charcoal dark:text-white">AI-Enhanced</div>
                      <div className="text-sm text-muted-foreground">Smart Photo Processing</div>
                      <div className="mt-2 flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-xs text-purple-600 font-medium">Latest Tech</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="btn-bronze"
                onClick={() => scrollToSection('contact')}
              >
                Get In Touch
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src={profile?.headshot || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"} 
                alt={`${profile?.name || 'Professional photographer'} portrait`}
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-bronze text-white p-6 rounded-lg shadow-lg">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Let's Create Something Beautiful</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Ready to capture your story? Reach out and let's discuss your vision.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-bronze rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Call</h3>
              <p className="text-white/70">{profile?.phone || "(808) 555-PHOTO"}</p>
            </div>
            <div className="text-center">
              <div className="bg-bronze rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Email</h3>
              <p className="text-white/70">{profile?.email || "christian@picaso.photography"}</p>
            </div>
            <div className="text-center">
              <div className="bg-bronze rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Based In</h3>
              <p className="text-white/70">{profile?.address || "Honolulu, Hawaii"}</p>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="text-center mb-12">
            <ContactForm trigger={
              <Button size="lg" variant="outline" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background h-11 rounded-md px-8 border-white hover:bg-white hover:text-charcoal text-[#2e2e2e]">
                <Mail className="mr-2 h-5 w-5" />
                Send Us a Message
              </Button>
            } />
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white/70 hover:text-bronze text-2xl transition-colors duration-200">
              <Instagram />
            </a>
            <a href="#" className="text-white/70 hover:text-bronze text-2xl transition-colors duration-200">
              <Facebook />
            </a>
            <a href="#" className="text-white/70 hover:text-bronze text-2xl transition-colors duration-200">
              <Youtube />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ultra-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-playfair text-2xl font-bold mb-4 flex items-center">
                <Camera className="h-6 w-6 mr-2 text-bronze" />
                {profile?.name || "Christian Picaso"}
              </h3>
              <p className="text-white/70 mb-4">
                {profile?.title || "Hawaii's premier photographer specializing in weddings, portraits, and aerial photography."}
              </p>
              <div className="text-sm text-white/60 text-left">
                FAA Certified • AI-Enhanced
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-bronze transition-colors duration-200">Wedding Photography</a></li>
                <li><a href="#" className="hover:text-bronze transition-colors duration-200">Portrait Sessions</a></li>
                <li><a href="#" className="hover:text-bronze transition-colors duration-200">Aerial Photography</a></li>
                <li><a href="#" className="hover:text-bronze transition-colors duration-200">Event Coverage</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#portfolio" className="hover:text-bronze transition-colors duration-200">Portfolio</a></li>
                <li><a href="#services" className="hover:text-bronze transition-colors duration-200">Pricing</a></li>
                <li><Link href="/booking" className="hover:text-bronze transition-colors duration-200">Booking</Link></li>
                <li><a href="#contact" className="hover:text-bronze transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">AI Features</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Smart Photo Selection</li>
                <li>Auto Gallery Creation</li>
                <li>24/7 Booking Assistant</li>
                <li>Predictive Scheduling</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 relative">
            <p className="mb-2">
              &copy; 2024 {profile?.name || "Captured by Christian"}. All rights reserved. | Licensed Drone Operator | AI-Enhanced Photography
            </p>
            
            {/* Admin Access Options */}
            <div className="flex justify-center items-center space-x-4 text-xs">
              <Link 
                href="/admin" 
                className="text-white/30 hover:text-bronze transition-colors duration-300 hover:scale-110 transform"
                title="Business Management Portal"
              >
                ⚙️ Admin
              </Link>
              
              <span className="text-white/20">|</span>
              
              <Link 
                href="/admin" 
                className="text-white/20 hover:text-bronze transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded"
                title="CRM Portal"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
