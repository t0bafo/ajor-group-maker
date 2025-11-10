import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ArrowRight, FileText, Star, HelpCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { MobileIconButton } from "@/components/MobileOptimized";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@/assets/ajor-logo.png";

const LandingNavigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setDrawerOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={logoImage} alt="Ajor Logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-cta to-accent bg-clip-text text-transparent">
                Ajor
              </span>
            </button>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-6">
                <a 
                  href="#how-it-works" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
                <Link 
                  to="/faq"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="default">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <MobileIconButton 
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </MobileIconButton>
            )}
          </div>
        </div>
      </nav>

      {/* Add padding to content to account for fixed nav */}
      <div className="h-16" />

      {/* Mobile Drawer Menu */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          
          {/* Primary CTA - Styled as Button */}
          <div className="px-4 py-2">
            <Link to="/auth" onClick={() => setDrawerOpen(false)}>
              <Button variant="hero" className="w-full" size="lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <Separator className="my-2" />
          
          {/* Anchor Links to Page Sections */}
          <nav className="px-4 py-2 space-y-1">
            <a 
              href="#how-it-works" 
              onClick={handleAnchorClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors active:scale-95"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">How It Works</span>
            </a>
            
            <a 
              href="#why-ajor"
              onClick={handleAnchorClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors active:scale-95"
            >
              <Star className="h-5 w-5 text-primary" />
              <span className="font-medium">Why Choose Ajor?</span>
            </a>
          </nav>
          
          <Separator className="my-2" />
          
          {/* Footer/Utility Links */}
          <nav className="px-4 py-2 space-y-1">
            <Link 
              to="/faq" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground active:scale-95"
            >
              <HelpCircle className="h-5 w-5" />
              <span>FAQ</span>
            </Link>
            
            <Link 
              to="/privacy"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground active:scale-95"
            >
              <Shield className="h-5 w-5" />
              <span>Privacy Policy</span>
            </Link>
            
            <Link 
              to="/terms"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground active:scale-95"
            >
              <FileText className="h-5 w-5" />
              <span>Terms of Service</span>
            </Link>
          </nav>
          
          <DrawerFooter>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Ajor. All rights reserved.
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default LandingNavigation;
