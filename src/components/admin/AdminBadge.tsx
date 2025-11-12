import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AdminBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2">
      <Badge 
        variant="destructive" 
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-lg"
      >
        <Shield className="h-4 w-4" />
        Admin Mode
      </Badge>
    </div>
  );
};
