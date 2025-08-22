import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism backdrop-blur-md border-b border-white/20 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 hover-lift">
            <div className="p-2 bg-gradient-to-r from-bronze to-teal rounded-full">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="font-playfair text-xl font-bold gradient-text">
              CapturedCCollective
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.href} href={link.href}>
                  <span className="text-foreground hover:text-bronze transition-colors duration-200 cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-bronze transition-colors duration-200"
                >
                  {link.label}
                </a>
              ),
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="mr-2"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <Link href="/client-portal">
              <Button
                variant="outline"
                className="border-bronze text-bronze hover:bg-bronze hover:text-white mr-2"
              >
                Client Portal
              </Button>
            </Link>
            <Link href="/booking">
              <Button className="btn-bronze">Book Now</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-background/95 dark:bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link key={link.href} href={link.href}>
                    <span
                      className="block px-3 py-2 text-foreground hover:text-bronze transition-colors duration-200 cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </span>
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-foreground hover:text-bronze transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ),
              )}
              <Link href="/booking">
                <Button
                  className="btn-bronze w-full mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
