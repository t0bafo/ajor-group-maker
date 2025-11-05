import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CulturalTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

const CulturalTooltip = ({ content, side = "right" }: CulturalTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs bg-card border-gold/20">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CulturalTooltip;
