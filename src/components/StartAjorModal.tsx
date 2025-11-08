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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const needsAdjustment = currentMemberCount !== plannedMemberCount;

  const handleConfirm = () => {
    // Check minimum requirement
    if (adjustedCount < 2) {
      return;
    }

    // If members are incomplete, show confirmation
    if (needsAdjustment && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Proceed with starting
    onConfirm(adjustedCount);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setAdjustedCount(currentMemberCount);
    onOpenChange(false);
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
          {!showConfirmation ? (
            <>
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

              {currentMemberCount < 2 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    You need at least <strong>2 members</strong> to start an Ajor. Please invite more members before starting.
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
                  Current members in group: {currentMemberCount} (minimum 2 required)
                </p>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Calendar className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  The start date will be recorded as <strong>{new Date().toLocaleDateString()}</strong>. 
                  This date will be used for all payout calculations and cycle tracking.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert variant="destructive" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-sm text-orange-900 dark:text-orange-100">
                <p className="font-semibold mb-2">⚠️ Confirm Starting with Incomplete Members</p>
                <p className="mb-2">
                  You're about to start this Ajor with <strong>{adjustedCount} members</strong> instead of the planned <strong>{plannedMemberCount} members</strong>.
                </p>
                <p className="text-xs">
                  This will permanently set the group size to {adjustedCount} members. All payout calculations will be based on this number.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {showConfirmation && (
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          )}
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            disabled={adjustedCount < 2 || adjustedCount > 20 || currentMemberCount < 2}
            className="w-full sm:w-auto"
            variant={showConfirmation ? "destructive" : "default"}
          >
            {showConfirmation ? "Confirm & Start" : "Start Ajor"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartAjorModal;