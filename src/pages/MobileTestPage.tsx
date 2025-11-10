import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Smartphone, Tablet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { meetsMinTouchTarget } from "@/lib/mobileUtils";
import logoImage from "@/assets/ajor-logo.png";

const MobileTestPage = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [testResults, setTestResults] = useState<{
    touchTargets: boolean;
    forms: boolean;
    modals: boolean;
    navigation: boolean;
  }>({
    touchTargets: false,
    forms: false,
    modals: false,
    navigation: false,
  });

  const testTouchTargets = () => {
    const buttons = document.querySelectorAll<HTMLElement>("button, a[role='button'], [role='button']");
    let allPass = true;
    
    buttons.forEach((btn) => {
      if (!meetsMinTouchTarget(btn)) {
        allPass = false;
      }
    });

    setTestResults(prev => ({ ...prev, touchTargets: allPass }));
    toast({
      title: allPass ? "Touch Targets Pass ✓" : "Touch Targets Fail ✗",
      description: allPass 
        ? "All interactive elements meet 44x44px minimum" 
        : "Some elements are too small for mobile",
      variant: allPass ? "default" : "destructive",
    });
  };

  const testForms = () => {
    const inputs = document.querySelectorAll<HTMLElement>("input, textarea, select");
    let allPass = true;
    
    inputs.forEach((input) => {
      if (!meetsMinTouchTarget(input)) {
        allPass = false;
      }
    });

    setTestResults(prev => ({ ...prev, forms: allPass }));
    toast({
      title: allPass ? "Form Inputs Pass ✓" : "Form Inputs Fail ✗",
      description: allPass 
        ? "All form inputs are mobile-friendly" 
        : "Some inputs need larger touch areas",
      variant: allPass ? "default" : "destructive",
    });
  };

  const deviceInfo = {
    isMobile: isMobile,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="Ajor Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-cta to-accent bg-clip-text text-transparent">
                Ajor Mobile Test
              </h1>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Device Info */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <div className="flex items-center gap-3">
                {isMobile ? (
                  <Smartphone className="h-6 w-6 text-primary" />
                ) : (
                  <Tablet className="h-6 w-6 text-accent" />
                )}
                <div>
                  <CardTitle>Device Information</CardTitle>
                  <CardDescription>Current device and viewport details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Device Type</p>
                  <Badge variant={isMobile ? "default" : "secondary"}>
                    {isMobile ? "Mobile" : "Desktop/Tablet"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Screen Size</p>
                  <p className="font-mono text-sm">{deviceInfo.screenWidth} × {deviceInfo.screenHeight}px</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pixel Ratio</p>
                  <p className="font-mono text-sm">{deviceInfo.devicePixelRatio}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Suite */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Mobile Optimization Tests</CardTitle>
              <CardDescription>
                Run these tests to verify mobile-friendliness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Touch Targets Test */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">Touch Targets (44x44px minimum)</p>
                  <p className="text-sm text-muted-foreground">
                    All buttons and interactive elements
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {testResults.touchTargets && (
                    <Check className="h-5 w-5 text-emerald" />
                  )}
                  <Button onClick={testTouchTargets} size="sm">
                    Test
                  </Button>
                </div>
              </div>

              {/* Form Inputs Test */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="font-medium">Form Inputs</p>
                  <p className="text-sm text-muted-foreground">
                    Input fields, dropdowns, and textareas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {testResults.forms && (
                    <Check className="h-5 w-5 text-emerald" />
                  )}
                  <Button onClick={testForms} size="sm">
                    Test
                  </Button>
                </div>
              </div>

              {/* Sample Form for Testing */}
              <div className="p-4 rounded-lg border border-border space-y-4">
                <p className="font-medium">Sample Form (for testing)</p>
                <div className="space-y-2">
                  <Label htmlFor="test-input">Text Input</Label>
                  <Input id="test-input" placeholder="Type here..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="test-checkbox" />
                  <Label htmlFor="test-checkbox">Checkbox</Label>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="test-switch">Switch</Label>
                  <Switch id="test-switch" />
                </div>
                <Button className="w-full">Submit Button</Button>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices Guide */}
          <Card className="shadow-[var(--shadow-medium)] border-primary/20">
            <CardHeader>
              <CardTitle>Mobile Best Practices ✓</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Touch targets minimum 44x44px</p>
                  <p className="text-sm text-muted-foreground">All buttons and links meet Apple/Android guidelines</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Responsive layouts with Tailwind breakpoints</p>
                  <p className="text-sm text-muted-foreground">Mobile-first design with sm/md/lg variants</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Forms prevent iOS zoom (16px font minimum)</p>
                  <p className="text-sm text-muted-foreground">No accidental zooming when focusing inputs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Smooth scrolling and touch feedback</p>
                  <p className="text-sm text-muted-foreground">-webkit-overflow-scrolling and active states</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Test */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>How to Test on Real Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Option 1: Browser DevTools</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Press F12 or Cmd+Option+I (Mac) to open DevTools</li>
                  <li>Click the device toolbar icon (top-left)</li>
                  <li>Select iPhone, Android, or custom dimensions</li>
                  <li>Test touch interactions and layouts</li>
                </ol>
              </div>
              <div>
                <p className="font-medium mb-2">Option 2: Physical Device</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open your app on your phone's browser</li>
                  <li>Test all interactive elements with your finger</li>
                  <li>Verify forms, modals, and navigation work smoothly</li>
                  <li>Check performance and scroll behavior</li>
                </ol>
              </div>
              <div>
                <p className="font-medium mb-2">Option 3: Lovable Preview</p>
                <p className="text-sm text-muted-foreground">
                  Click the device icons above the preview window to switch between mobile, tablet, and desktop views.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MobileTestPage;
