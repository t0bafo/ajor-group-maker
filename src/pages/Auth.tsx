import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { emailSchema } from "@/lib/validation";
import { Separator } from "@/components/ui/separator";

// Signup form schema
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: emailSchema,
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Form for signup with validation
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    // Check for redirect paths
    const pendingInviteCode = sessionStorage.getItem("pendingInviteCode");
    const returnToJoin = sessionStorage.getItem("returnToJoin");
    const redirectTo = sessionStorage.getItem("redirectTo");
    
    // Only clear sessionStorage if NOT returning from a flow
    if (!returnToJoin && !pendingInviteCode && !redirectTo) {
      sessionStorage.clear();
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Priority 1: Pending invite code
        if (pendingInviteCode) {
          const code = pendingInviteCode;
          sessionStorage.removeItem("pendingInviteCode");
          navigate(`/join/${code}`);
        }
        // Priority 2: Return to join flow
        else if (returnToJoin) {
          sessionStorage.removeItem("returnToJoin");
          navigate("/group-overview");
        }
        // Priority 3: Custom redirect
        else if (redirectTo) {
          const path = redirectTo;
          sessionStorage.removeItem("redirectTo");
          navigate(path);
        }
        // Default: Dashboard
        else {
          navigate("/dashboard");
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Send welcome email for new Google sign-ups
        if (session.user.app_metadata.provider === "google") {
          const isNewUser = new Date(session.user.created_at).getTime() > Date.now() - 10000; // Created within last 10 seconds
          if (isNewUser) {
            setTimeout(() => {
              supabase.functions.invoke("send-notification", {
                body: {
                  type: "welcome_email",
                  recipientEmail: session.user.email!,
                  recipientName: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
                  data: {},
                },
              }).catch((error) => {
                console.error("Failed to send welcome email:", error);
              });
            }, 0);
          }
        }

        // Check for pending invite code first
        const inviteCode = sessionStorage.getItem("pendingInviteCode");
        if (inviteCode) {
          sessionStorage.removeItem("pendingInviteCode");
          navigate(`/join/${inviteCode}`);
          return;
        }
        
        // Check if returning from join flow
        const isJoinFlow = sessionStorage.getItem("returnToJoin");
        if (isJoinFlow) {
          sessionStorage.removeItem("returnToJoin");
          navigate("/group-overview");
          return;
        }
        
        // Check for custom redirect
        const redirect = sessionStorage.getItem("redirectTo");
        if (redirect) {
          sessionStorage.removeItem("redirectTo");
          navigate(redirect);
          return;
        }
        
        // Default: Clear and go to dashboard with welcome message
        sessionStorage.clear();
        
        // Check if this is first login
        const isNewUser = event === "SIGNED_IN" && session.user.created_at === session.user.last_sign_in_at;
        if (isNewUser) {
          setTimeout(() => {
            toast({
              title: "Welcome to Ajor",
              description: "Where community meets savings.",
            });
          }, 500);
        }
        
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (values: SignupFormData) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: values.name,
            phone: values.phone,
          },
        },
      });

      if (error) throw error;

      // Check if user already exists (Supabase returns user but with identities empty array)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        signupForm.setError("email", {
          type: "manual",
          message: "This email is already registered. Please log in instead.",
        });
        toast({
          title: "Email already registered",
          description: "Please use the login tab to access your account.",
          variant: "destructive",
        });
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to Ajor. Redirecting to your dashboard...",
        });
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message.toLowerCase().includes("already registered") || 
          error.message.toLowerCase().includes("already exists")) {
        signupForm.setError("email", {
          type: "manual",
          message: "This email is already registered. Please log in instead.",
        });
        toast({
          title: "Email already registered",
          description: "Please use the login tab to access your account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Ajor</CardTitle>
            <CardDescription>
              Save together, grow together with trusted community savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="space-y-4">
                  <Button
                    type="button"
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4 mb-4">
                  <Button
                    type="button"
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </div>
                
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Maya Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Must be at least 6 characters
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
