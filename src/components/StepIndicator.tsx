import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const stepNumber = index + 1;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300
                    ${
                      isComplete
                        ? "bg-emerald text-emerald-foreground shadow-[var(--shadow-soft)]"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-gold)]"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`
                    mt-2 text-xs font-medium text-center
                    ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {step}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-2 transition-all duration-300
                    ${isComplete ? "bg-emerald" : "bg-border"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
