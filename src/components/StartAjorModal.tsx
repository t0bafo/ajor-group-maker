import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Users, AlertCircle } from "lucide-react";
import { LoadingButton } from "./LoadingButton";

interface StartAjorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  currentMemberCount: number;
  plannedMemberCount: number;
  onConfirm: (adjustedMemberCount: number) => void;
  loading?: boolean;
}

const StartAjorModal = ({
  open,
  onOpenChange,
  groupName,
  currentMemberCount,
  plannedMemberCount,
  onConfirm,
  loading = false,
}: StartAjorModalProps) => {
  const [adjustedCount, setAdjustedCount] = useState(currentMemberCount);
  const needsAdjustment = currentMemberCount !== plannedMemberCount;

  const handleConfirm = () => {
    onConfirm(adjustedCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Start Ajor
          </DialogTitle>
          <DialogDescription>
            {needsAdjustment 
              ? "Adjust member count before starting"
              : "Ready to officially start your Ajor?"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Group Name</Label>
            <div className="text-sm text-muted-foreground">{groupName}</div>
          </div>

          {needsAdjustment && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your group has <strong>{currentMemberCount}</strong> members but was planned for <strong>{plannedMemberCount}</strong>. 
                Adjust the member count to match your actual group size before starting.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="memberCount" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Members
            </Label>
            <Input
              id="memberCount"
              type="number"
              min="2"
              max="20"
              value={adjustedCount}
              onChange={(e) => setAdjustedCount(parseInt(e.target.value) || 2)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current members in group: {currentMemberCount}
            </p>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <Calendar className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              The start date will be recorded as <strong>{new Date().toLocaleDateString()}</strong>. 
              This date will be used for all payout calculations and cycle tracking.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            disabled={adjustedCount < 2 || adjustedCount > 20}
            className="w-full sm:w-auto"
          >
            Start Ajor
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartAjorModal;