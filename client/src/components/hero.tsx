import { Button } from "@/components/ui/button";
import { ChevronDown, Award } from "lucide-react";

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
        >
          <source
            src="/attached_assets/20250619_1046_Honolulu Sunset Vibes_simple_compose_01jy4z2q86e6mbdtxctwr6e8mn_1752351152753.mp4"
            type="video/mp4"
          />
          {/* Fallback image if video fails to load */}
          <img
            src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Honolulu Sunset Vibes background"
            className="w-full h-full object-cover"
          />
        </video>
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
              <span className="text-lg font-medium text-white/90">
                CapturedCCollective Media Team
              </span>
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
            <div className="bg-black/30 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 max-w-5xl mx-auto">
              <p className="text-lg md:text-xl lg:text-2xl mb-3 md:mb-4 font-light leading-relaxed drop-shadow-lg text-[#e9e7eb]">
                Blending professionalism with creativity to deliver cinematic,
                high-impact content —
                <span className="text-bronze font-medium">
                  {" "}
                  capturing emotion, energy, and vision
                </span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90">
                <span className="flex items-center text-[#fcfcfc]">
                  <div className="w-2 h-2 bg-bronze rounded-full mr-2"></div>
                  Real Estate + Events
                </span>
                <span className="flex items-center text-[#fcfcfc]">
                  <div className="w-2 h-2 bg-teal rounded-full mr-2"></div>
                  Branded Visuals
                </span>
                <span className="flex items-center text-[#fcfcfc]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  FAA Certified
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="btn-bronze text-lg font-medium px-8 py-4 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-bronze/50 group"
              onClick={() => scrollToSection("portfolio")}
            >
              <span className="mr-2">View Portfolio</span>
              <div className="w-0 h-0.5 bg-white group-hover:w-4 transition-all duration-300"></div>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-charcoal text-lg font-medium px-8 py-4 transition-all duration-300 hover:shadow-xl"
              onClick={() => scrollToSection("booking")}
            >
              Book Session
            </Button>
          </div>

          {/* Brand Values with Background */}
          <div className="mt-12 bg-black/25 backdrop-blur-sm rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex justify-center items-center space-x-8 text-white">
              <div className="text-center">
                <div className="text-xl font-bold drop-shadow-lg text-[#836937]">
                  Intentionality
                </div>
                <div className="text-sm text-white/90">Every Shot</div>
              </div>
              <div className="w-px h-8 bg-white/40"></div>
              <div className="text-center">
                <div className="text-xl font-bold drop-shadow-lg text-[#836937]">
                  Artistry
                </div>
                <div className="text-sm text-white/90">Creative Vision</div>
              </div>
              <div className="w-px h-8 bg-white/40"></div>
              <div className="text-center">
                <div className="text-xl font-bold drop-shadow-lg text-[#836937]">
                  Precision
                </div>
                <div className="text-sm text-white/90">Professional Grade</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white" />
      </div>
    </section>
  );
}
