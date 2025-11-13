import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  onConfirm: (reason: string) => Promise<void>;
}

export const RemoveMemberDialog = ({
  open,
  onOpenChange,
  memberName,
  onConfirm,
}: RemoveMemberDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  const handleConfirm = async () => {
    if (confirmText !== "REMOVE") return;
    
    setIsRemoving(true);
    try {
      await onConfirm(reason);
      setConfirmText("");
      setReason("");
      onOpenChange(false);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-4">
            <p>
              You are about to remove <span className="font-semibold text-foreground">{memberName}</span> from this Ajor group.
            </p>
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">Warning:</p>
              <ul className="text-sm text-destructive/90 mt-1 space-y-1 list-disc list-inside">
                <li>This will permanently remove the member</li>
                <li>Their contributions will remain in history</li>
                <li>Cycle dates may need recalculation</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="reason">Reason for Removal (Required)</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this member is being removed..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="confirm">Type "REMOVE" to confirm</Label>
                <Input
                  id="confirm"
                  placeholder="Type REMOVE in capital letters"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText !== "REMOVE" || !reason.trim() || isRemoving}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isRemoving ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};