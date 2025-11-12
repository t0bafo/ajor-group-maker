import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cycle {
  id: string;
  cycle_number: number;
  status: "completed" | "current" | "upcoming";
}

interface CycleTimelineProps {
  cycles: Cycle[];
  currentCycle: number;
  onCycleClick?: (cycleNumber: number) => void;
}

export const CycleTimeline = ({ cycles, currentCycle, onCycleClick }: CycleTimelineProps) => {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center gap-2 min-w-max px-2">
        {cycles.map((cycle, index) => {
          const isCompleted = cycle.cycle_number < currentCycle;
          const isCurrent = cycle.cycle_number === currentCycle;
          const isUpcoming = cycle.cycle_number > currentCycle;

          return (
            <div key={cycle.id} className="flex items-center">
              <button
                onClick={() => onCycleClick?.(cycle.cycle_number)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg transition-all min-w-[80px]",
                  isCurrent && "bg-primary/10 ring-2 ring-primary",
                  !isCurrent && "hover:bg-accent"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-primary text-primary-foreground",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted && <Check className="w-5 h-5" />}
                  {isCurrent && <Clock className="w-5 h-5" />}
                  {isUpcoming && <Circle className="w-5 h-5" />}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  Cycle {cycle.cycle_number}
                </span>
              </button>

              {index < cycles.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 mx-1",
                    cycle.cycle_number < currentCycle ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
