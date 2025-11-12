import { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, DollarSign, Repeat, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { useIsMobile } from "@/hooks/use-mobile";

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const isMobile = useIsMobile();

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-4 p-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-cta to-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-card" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Ajor!</h2>
          </div>
          <p className="text-muted-foreground">
            Let's take 2 minutes to show you around and help you get started with your first savings group.
          </p>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setStepIndex(1)} size="lg">
              Let's Go
            </Button>
            <Button onClick={onSkip} variant="ghost">
              Skip for Now
            </Button>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div className="space-y-4 p-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-cta to-accent flex items-center justify-center">
              <Users className="h-5 w-5 text-card" />
            </div>
            <h2 className="text-xl font-bold">What is Ajor?</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Ajor is a digital platform for <span className="font-semibold text-foreground">rotating savings groups</span>—a cultural practice known as <span className="font-semibold text-foreground">ajo</span> or <span className="font-semibold text-foreground">susu</span>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Everyone saves together, and members take turns receiving the full pot. It's about community, trust, and mutual support.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div className="space-y-4 p-2">
          <h2 className="text-xl font-bold mb-3">3 Key Things to Know</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">1. Contributions</p>
                <p className="text-sm text-muted-foreground">Everyone pays the same amount on the same schedule</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Repeat className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold">2. Rotation</p>
                <p className="text-sm text-muted-foreground">One person gets the full pot each cycle</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-emerald" />
              </div>
              <div>
                <p className="font-semibold">3. Commitment</p>
                <p className="text-sm text-muted-foreground">You pay for FULL duration—even after receiving your payout</p>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".dashboard-create-button",
      content: (
        <div className="space-y-4 p-2">
          <h2 className="text-xl font-bold">Two Ways to Start</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can either <span className="font-semibold text-foreground">create a new group</span> if you want to host, or <span className="font-semibold text-foreground">join an existing group</span> using an invite code.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="font-semibold text-sm">Create New</p>
              <p className="text-xs text-muted-foreground">Be the host</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="font-semibold text-sm">Join Group</p>
              <p className="text-xs text-muted-foreground">Use invite code</p>
            </div>
          </div>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div className="space-y-4 p-2 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-cta to-accent flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-card" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">You're All Set!</h2>
          <p className="text-muted-foreground">
            You can replay this tour anytime from your Profile settings.
          </p>
          <Button onClick={onComplete} size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (status === STATUS.FINISHED) {
        // Trigger confetti on completion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onComplete();
      }
    }

    if (type === "step:after") {
      // Move to next step
      setStepIndex(index + (action === "prev" ? -1 : 1));
    }
  };

  return (
    <Joyride
      steps={steps}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      run={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: isMobile ? 16 : 12,
          padding: 0,
          maxWidth: isMobile ? "calc(100vw - 32px)" : 420,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipContent: {
          padding: isMobile ? "20px" : "16px",
        },
        buttonNext: {
          display: stepIndex === 0 ? "none" : "block",
          backgroundColor: "hsl(var(--primary))",
          borderRadius: 8,
          padding: isMobile ? "12px 24px" : "8px 16px",
          minHeight: isMobile ? 44 : "auto",
          fontSize: isMobile ? "16px" : "14px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 8,
          padding: isMobile ? "12px 24px" : "8px 16px",
          minHeight: isMobile ? 44 : "auto",
          fontSize: isMobile ? "16px" : "14px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          padding: isMobile ? "12px" : "8px",
          minHeight: isMobile ? 44 : "auto",
          fontSize: isMobile ? "16px" : "14px",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip",
      }}
      disableScrolling={true}
      spotlightClicks={false}
    />
  );
};

export default OnboardingTour;
