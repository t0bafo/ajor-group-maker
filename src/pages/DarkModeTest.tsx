import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Moon, Sun, Check, X, AlertTriangle } from "lucide-react";
import { getColorPairsFromCSS } from "@/lib/contrastChecker";
import logoImage from "@/assets/ajor-logo.png";

const DarkModeTest = () => {
  const [isDark, setIsDark] = useState(false);
  const [contrastResults, setContrastResults] = useState<ReturnType<typeof getColorPairsFromCSS>>([]);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
    
    // Run contrast tests
    updateContrastTests();
  }, []);

  const updateContrastTests = () => {
    setTimeout(() => {
      const results = getColorPairsFromCSS();
      setContrastResults(results);
    }, 100); // Small delay to ensure CSS has updated
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
    updateContrastTests();
  };

  const passCount = contrastResults.filter(r => r.passes).length;
  const failCount = contrastResults.filter(r => !r.passes).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="Ajor Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-cta to-accent bg-clip-text text-transparent">
                Dark Mode Test
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
          {/* Theme Toggle */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-6 w-6 text-primary" />
                  ) : (
                    <Sun className="h-6 w-6 text-accent" />
                  )}
                  <div>
                    <CardTitle>Theme Mode</CardTitle>
                    <CardDescription>
                      {isDark ? "Dark mode enabled" : "Light mode enabled"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="theme-toggle">Dark Mode</Label>
                  <Switch
                    id="theme-toggle"
                    checked={isDark}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contrast Test Results */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WCAG Contrast Compliance</CardTitle>
                  <CardDescription>
                    All color pairs must pass WCAG AA (4.5:1 ratio for normal text)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={passCount === contrastResults.length ? "default" : "destructive"}>
                    {passCount} Pass / {failCount} Fail
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {contrastResults.map((result) => (
                <div
                  key={result.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{result.name}</p>
                      <Badge
                        variant={result.passes ? "default" : "destructive"}
                        className={
                          result.passes
                            ? "bg-emerald/20 text-emerald border-emerald/30"
                            : ""
                        }
                      >
                        {result.grade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ratio: {result.ratio}:1
                      {result.ratio >= 7 && " (AAA)"}
                      {result.ratio >= 4.5 && result.ratio < 7 && " (AA)"}
                      {result.ratio >= 3 && result.ratio < 4.5 && " (AA Large text only)"}
                      {result.ratio < 3 && " (Insufficient)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.passes ? (
                      <Check className="h-5 w-5 text-emerald" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" />
                    )}
                    <div className="flex gap-1">
                      <div
                        className="w-8 h-8 rounded border border-border"
                        style={{ background: `hsl(${result.background})` }}
                        title={`Background: hsl(${result.background})`}
                      />
                      <div
                        className="w-8 h-8 rounded border border-border"
                        style={{ background: `hsl(${result.foreground})` }}
                        title={`Foreground: hsl(${result.foreground})`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Glassmorphic Test */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Glassmorphic Effects Test</CardTitle>
              <CardDescription>
                Testing backdrop blur and transparency in {isDark ? "dark" : "light"} mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Glass card example */}
              <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-cta/20 to-accent/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      background: "var(--glass-bg)",
                      borderColor: "var(--glass-border)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <p className="font-semibold text-lg mb-2">Glassmorphic Card</p>
                    <p className="text-muted-foreground">
                      Text should be readable over blurred background
                    </p>
                  </div>
                </div>
              </div>

              {/* Text readability check */}
              <div className="p-6 rounded-lg bg-muted/50 space-y-3">
                <p className="text-foreground font-semibold">Primary Text (foreground)</p>
                <p className="text-muted-foreground">Muted Text (muted-foreground)</p>
                <div className="flex gap-2">
                  <Badge>Default Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component Samples */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Component Readability Test</CardTitle>
              <CardDescription>
                Verify all UI components are readable in {isDark ? "dark" : "light"} mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Card Title</CardTitle>
                  <CardDescription>Card description text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This card should have good contrast between background and all text elements.
                  </p>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                <p className="font-semibold">Primary Background</p>
                <p>Text on primary background should be clearly readable</p>
              </div>

              <div className="p-4 rounded-lg bg-accent text-accent-foreground">
                <p className="font-semibold">Accent Background</p>
                <p>Text on accent background should be clearly readable</p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {failCount > 0 && (
            <Card className="shadow-[var(--shadow-medium)] border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div>
                    <CardTitle>Contrast Issues Detected</CardTitle>
                    <CardDescription>
                      {failCount} color pair{failCount !== 1 ? "s" : ""} need{failCount === 1 ? "s" : ""} improvement
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>WCAG AA requires a minimum 4.5:1 ratio for normal text</li>
                  <li>WCAG AA requires a minimum 3:1 ratio for large text (18pt+ or 14pt+ bold)</li>
                  <li>Adjust lightness values in index.css to improve contrast</li>
                  <li>Consider using higher contrast colors for critical UI elements</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DarkModeTest;
