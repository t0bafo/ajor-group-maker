import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Shield, ArrowRight, UserPlus, DollarSign, Repeat } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Save Together,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Grow Together
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Build financial discipline through trusted community savings groups. 
                Experience the power of collective accountability with Ajor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn How It Works
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl"></div>
              <img
                src={heroImage}
                alt="Community of young professionals collaborating on financial goals"
                className="relative rounded-2xl shadow-[var(--shadow-medium)] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to start saving with your community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                <UserPlus className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">1. Create an Ajor</h3>
                <p className="text-muted-foreground">
                  Start a savings group with friends, family, or trusted colleagues.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                <DollarSign className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">2. Contribute Together</h3>
                <p className="text-muted-foreground">
                  Each member contributes their share manually every cycle.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                <Repeat className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">3. Payout in Turns</h3>
                <p className="text-muted-foreground">
                  Each member receives their payout when it's their turn in the rotation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ajor Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Ajor?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by young professionals who value community and financial growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community-Driven</h3>
              <p className="text-muted-foreground">
                Save with trusted friends and family. Build accountability through shared financial goals.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Growth</h3>
              <p className="text-muted-foreground">
                Track your savings progress and watch your financial discipline improve over time.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Platform</h3>
              <p className="text-muted-foreground">
                Simple, transparent, and secure. Your savings journey made easy and reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join young professionals building financial discipline through trusted community savings
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg">
              Create Your First Ajor Group
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">Ajor</h3>
              <p className="text-sm text-muted-foreground">
                Save together. Grow together.
              </p>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          <div className="text-center mt-6 pt-6 border-t text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ajor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
