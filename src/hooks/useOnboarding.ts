import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = (userId: string | undefined) => {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed_at, onboarding_dismissed")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }

        // Show tour if user hasn't completed it and hasn't dismissed it
        if (profile && !profile.onboarding_completed_at && !profile.onboarding_dismissed) {
          setShouldShowTour(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [userId]);

  const markOnboardingComplete = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      setShouldShowTour(false);
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
    }
  };

  const dismissOnboarding = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_dismissed: true })
        .eq("id", userId);

      if (error) throw error;
      setShouldShowTour(false);
    } catch (error) {
      console.error("Error dismissing onboarding:", error);
    }
  };

  const resetOnboarding = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed_at: null,
          onboarding_dismissed: false,
        })
        .eq("id", userId);

      if (error) throw error;
      setShouldShowTour(true);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  return {
    shouldShowTour,
    isLoading,
    markOnboardingComplete,
    dismissOnboarding,
    resetOnboarding,
  };
};
