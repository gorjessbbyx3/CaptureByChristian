import { Button } from "@/components/ui/button";
import { ChevronDown, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function Hero() {
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Use hero image from profile if available, otherwise fallback to current setup
  const heroContent = profile?.heroImage ? (
    <img 
      src={profile.heroImage}
      alt="Hero background"
      className="w-full h-full object-cover"
    />
  ) : (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    >
      <source src="/attached_assets/20250619_1046_Honolulu Sunset Vibes_simple_compose_01jy4z2q86e6mbdtxctwr6e8mn_1752351152753.mp4" type="video/mp4" />
      <img 
        src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
        alt="Hawaii landscape photography"
        className="w-full h-full object-cover"
      />
    </video>
  );

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Dynamic Background - Hero Image or Video */}
      <div className="absolute inset-0">
        {heroContent}
      </div>

      {/* Enhanced Overlay with Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/80 animate-gradient-shift"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-black/30 to-black/40"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-bronze/20 to-teal/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-tl from-teal/15 to-bronze/15 rounded-full blur-xl animate-float-delayed"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-6 animate-fade-in max-w-5xl">
          {/* Enhanced Badge */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-bronze/20 to-teal/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 flex items-center space-x-3">
              <Award className="h-6 w-6 text-bronze animate-pulse" />
              <span className="text-lg font-medium text-white/90">CapturedCCollective Media Team</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced Title with CapturedCCollective Branding */}
          <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter text-[#fcfcfc]">
              Content & Cinematic
            </span>
            <br />
            <span className="text-5xl md:text-7xl bg-gradient-to-r from-bronze via-sandstone to-teal bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-shimmer">
              Creative Excellence
            </span>
          </h1>

          {/* Enhanced Description with CapturedCCollective Messaging */}
          <div className="mb-6 md:mb-10">
            <p className="text-xl md:text-2xl text-white/85 leading-relaxed max-w-4xl mx-auto font-light">
              Hawai'i-based media team specializing in <span className="text-bronze font-medium">cinematic, high-impact content</span> that captures emotion, energy, and vision with intentionality, artistry, and precision.
            </p>
            <p className="text-lg md:text-xl text-white/70 mt-4 max-w-3xl mx-auto">
              Real estate | Events | Branded visual content
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-bronze to-sandstone hover:from-sandstone hover:to-bronze text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
              onClick={() => scrollToSection('portfolio')}
            >
              View Our Work
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 rounded-full transition-all duration-300"
              onClick={() => scrollToSection('contact')}
            >
              Get in Touch
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown 
              className="h-8 w-8 text-white/60 cursor-pointer hover:text-white transition-colors duration-300" 
              onClick={() => scrollToSection('about')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}