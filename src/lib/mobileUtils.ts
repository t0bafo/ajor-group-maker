/**
 * Mobile optimization utilities
 */

/**
 * Check if touch target meets minimum size (44x44px)
 */
export const meetsMinTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
};

/**
 * Add touch feedback to element
 */
export const addTouchFeedback = (element: HTMLElement) => {
  (element.style as any).webkitTapHighlightColor = "transparent";
  (element.style as any).touchAction = "manipulation";
  
  element.addEventListener("touchstart", () => {
    element.style.transform = "scale(0.95)";
  }, { passive: true });
  
  element.addEventListener("touchend", () => {
    element.style.transform = "scale(1)";
  }, { passive: true });
};

/**
 * Prevent zoom on iOS when focusing inputs
 */
export const preventIOSZoom = () => {
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="number"], textarea, select'
  );
  
  inputs.forEach(input => {
    if (!input.style.fontSize || parseFloat(input.style.fontSize) < 16) {
      input.style.fontSize = "16px";
    }
  });
};

/**
 * Check if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get safe area insets (for iPhone notch, etc.)
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("--safe-area-inset-top") || "0"),
    right: parseInt(style.getPropertyValue("--safe-area-inset-right") || "0"),
    bottom: parseInt(style.getPropertyValue("--safe-area-inset-bottom") || "0"),
    left: parseInt(style.getPropertyValue("--safe-area-inset-left") || "0"),
  };
};

/**
 * Optimize scrolling performance on mobile
 */
export const optimizeMobileScrolling = () => {
  if (typeof document !== "undefined") {
    (document.documentElement.style as any).webkitOverflowScrolling = "touch";
    document.body.style.overscrollBehavior = "none";
  }
};
