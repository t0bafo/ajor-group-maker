import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Shield, ArrowRight, UserPlus, DollarSign, Repeat } from "lucide-react";
import heroImage from "@/assets/hero-ajor-community.jpg";
import logoImage from "@/assets/ajor-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-primary text-sm font-semibold mb-4 backdrop-blur-xl shadow-[var(--shadow-soft)]">
                  💰 The Culture of Saving
                </div>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                  Save Together,{" "}
                  <span className="bg-[var(--gradient-warm)] bg-clip-text text-transparent">
                    Grow Together
                  </span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Build wealth through trusted community savings groups. 
                Experience the power of collective accountability. 🚀
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto group">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="glass" size="lg" className="w-full sm:w-auto">
                    Learn How It Works
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="absolute -inset-8 bg-[var(--gradient-warm)] rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-[var(--shadow-large)]">
                <img
                  src={heroImage}
                  alt="Community of young professionals collaborating on financial goals"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              How It Works ✨
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Three simple steps to start saving with your community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="text-center space-y-6 group animate-fade-in">
              <div className="w-24 h-24 rounded-3xl bg-[var(--gradient-hero)] flex items-center justify-center mx-auto shadow-[var(--shadow-medium)] group-hover:shadow-[var(--shadow-glow-orange)] transition-all group-hover:scale-110 group-hover:rotate-3">
                <UserPlus className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold">1. Create an Ajor</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start a savings group with friends, family, or trusted colleagues.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group animate-fade-in [animation-delay:100ms]">
              <div className="w-24 h-24 rounded-3xl bg-[var(--gradient-hero)] flex items-center justify-center mx-auto shadow-[var(--shadow-medium)] group-hover:shadow-[var(--shadow-glow-orange)] transition-all group-hover:scale-110 group-hover:rotate-3">
                <DollarSign className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold">2. Contribute Together</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each member contributes their share manually every cycle.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group animate-fade-in [animation-delay:200ms]">
              <div className="w-24 h-24 rounded-3xl bg-[var(--gradient-hero)] flex items-center justify-center mx-auto shadow-[var(--shadow-medium)] group-hover:shadow-[var(--shadow-glow-orange)] transition-all group-hover:scale-110 group-hover:rotate-3">
                <Repeat className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold">3. Payout in Turns</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each member receives their payout when it's their turn in the rotation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ajor Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Why Choose Ajor? 🎯
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Trusted by young professionals who value community and financial growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] transition-all group border border-[var(--glass-border)] hover:border-primary/30">
              <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Community-Driven</h3>
              <p className="text-muted-foreground leading-relaxed">
                Save with trusted friends and family. Build accountability through shared financial goals.
              </p>
            </div>

            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] transition-all group border border-[var(--glass-border)] hover:border-primary/30">
              <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Financial Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your savings progress and watch your financial discipline improve over time.
              </p>
            </div>

            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-large)] transition-all group border border-[var(--glass-border)] hover:border-primary/30">
              <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Trusted Platform</h3>
              <p className="text-muted-foreground leading-relaxed">
                Simple, transparent, and secure. Your savings journey made easy and reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-muted/50 via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary))_0%,transparent_50%)] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Ready to Start Saving? 🚀
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              Join young professionals building wealth through trusted community savings
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-lg px-12 group">
                Create Your First Ajor
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <img src={logoImage} alt="Ajor Logo" className="w-12 h-12" />
                <h3 className="font-display text-2xl font-bold bg-[var(--gradient-warm)] bg-clip-text text-transparent">
                  Ajor
                </h3>
              </div>
              <p className="text-muted-foreground">
                Save together. Grow together. 💰
              </p>
            </div>
            <nav className="flex gap-8 text-sm">
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
          <div className="text-center mt-8 pt-8 border-t border-border/50 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ajor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
