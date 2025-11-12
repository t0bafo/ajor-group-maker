import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface ResetGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    group_name: string;
    contributionsCount?: number;
    contributionsTotal?: number;
    payoutsCount?: number;
  };
  onSuccess?: () => void;
}

export const ResetGroupDialog = ({
  open,
  onOpenChange,
  group,
  onSuccess,
}: ResetGroupDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { resetGroup } = useAdmin();

  const isConfirmed = confirmText.toUpperCase() === "RESET";

  const handleReset = async () => {
    if (!isConfirmed) return;

    setIsResetting(true);
    try {
      const result = await resetGroup(group.id, group.group_name);
      
      if (result.success) {
        onOpenChange(false);
        setConfirmText("");
        onSuccess?.();
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Reset Group to Initial State
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-foreground">
                <p className="font-semibold mb-2">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{group.contributionsCount || 0} contributions (${group.contributionsTotal?.toFixed(2) || "0.00"} total)</li>
                  <li>{group.payoutsCount || 0} payouts</li>
                  <li>All cycle progress</li>
                </ul>
                <p className="mt-3 font-semibold">
                  The group will return to 'Not Started' status.
                  Members will be notified.
                </p>
                <p className="mt-2 text-destructive font-bold">
                  This CANNOT be undone.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirm-reset">
                Type <span className="font-mono font-bold">RESET</span> to confirm:
              </Label>
              <Input
                id="confirm-reset"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET"
                className="font-mono"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={!isConfirmed || isResetting}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isResetting ? "Resetting..." : "Reset Group"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
