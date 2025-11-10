import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-optimized button wrapper
 * Ensures minimum 44x44px touch target on mobile devices
 */
export const MobileTouchTarget = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      "min-h-[44px] min-w-[44px]",
      "md:min-h-0 md:min-w-0", // Remove minimum on larger screens
      className
    )}
    {...props}
  >
    {children}
  </div>
));
MobileTouchTarget.displayName = "MobileTouchTarget";

/**
 * Mobile-optimized icon button
 * Wraps small icons in proper touch targets
 */
export const MobileIconButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md",
      "min-h-[44px] min-w-[44px]",
      "active:scale-95 transition-transform",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
MobileIconButton.displayName = "MobileIconButton";
