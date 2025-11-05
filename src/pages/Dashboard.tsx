import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Users, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ajor
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              Welcome to Ajor
            </h2>
            <p className="text-lg text-muted-foreground">
              Start saving together with your trusted community
            </p>
          </div>

          {/* Main CTAs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create New Ajor */}
            <Card className="hover:shadow-[var(--shadow-medium)] transition-all cursor-pointer group" onClick={() => navigate("/group-setup")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Create New Ajor</CardTitle>
                <CardDescription>
                  Start a new rotating savings group with friends, family, or trusted colleagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Join Existing Ajor */}
            <Card className="hover:shadow-[var(--shadow-medium)] transition-all cursor-pointer group" onClick={() => navigate("/join-group")}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Join Existing Ajor</CardTitle>
                <CardDescription>
                  Join a savings group using an invitation code from your group host
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Join Group
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Your Ajors Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6">Your Ajors</h3>
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You haven't joined or created any Ajors yet. Start one now!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
