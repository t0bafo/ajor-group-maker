/**
 * Contrast ratio calculation and WCAG compliance checking
 */

/**
 * Parse HSL color string to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Parse HSL strings (format: "h s% l%")
  const parseHSL = (hsl: string) => {
    const parts = hsl.split(/\s+/);
    return {
      h: parseFloat(parts[0]),
      s: parseFloat(parts[1]),
      l: parseFloat(parts[2])
    };
  };

  const hsl1 = parseHSL(color1);
  const hsl2 = parseHSL(color2);

  const [r1, g1, b1] = hslToRgb(hsl1.h, hsl1.s, hsl1.l);
  const [r2, g2, b2] = hslToRgb(hsl2.h, hsl2.s, hsl2.l);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGStandard(
  ratio: number,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean {
  if (level === "AAA") {
    return size === "large" ? ratio >= 4.5 : ratio >= 7;
  }
  return size === "large" ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get contrast grade (AAA, AA, AA Large, Fail)
 */
export function getContrastGrade(ratio: number, size: "normal" | "large" = "normal"): string {
  if (meetsWCAGStandard(ratio, "AAA", size)) return "AAA";
  if (meetsWCAGStandard(ratio, "AA", size)) return "AA";
  if (size === "normal" && ratio >= 3) return "AA Large";
  return "Fail";
}

/**
 * Get all color pairs from CSS variables
 */
export function getColorPairsFromCSS(): Array<{
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  grade: string;
  passes: boolean;
}> {
  const root = getComputedStyle(document.documentElement);
  
  const pairs = [
    { name: "Background/Foreground", bg: "--background", fg: "--foreground" },
    { name: "Card", bg: "--card", fg: "--card-foreground" },
    { name: "Primary", bg: "--primary", fg: "--primary-foreground" },
    { name: "Secondary", bg: "--secondary", fg: "--secondary-foreground" },
    { name: "Muted", bg: "--muted", fg: "--muted-foreground" },
    { name: "Accent", bg: "--accent", fg: "--accent-foreground" },
    { name: "CTA", bg: "--cta", fg: "--cta-foreground" },
    { name: "Destructive", bg: "--destructive", fg: "--destructive-foreground" },
    { name: "Emerald", bg: "--emerald", fg: "--emerald-foreground" },
  ];

  return pairs.map(({ name, bg, fg }) => {
    const bgColor = root.getPropertyValue(bg).trim();
    const fgColor = root.getPropertyValue(fg).trim();
    const ratio = getContrastRatio(bgColor, fgColor);
    const grade = getContrastGrade(ratio);
    const passes = meetsWCAGStandard(ratio, "AA");

    return {
      name,
      foreground: fgColor,
      background: bgColor,
      ratio: Math.round(ratio * 100) / 100,
      grade,
      passes,
    };
  });
}
