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

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    id: string;
    group_name: string;
    memberCount?: number;
    contributionsCount?: number;
    contributionsTotal?: number;
  };
  onSuccess?: () => void;
}

export const DeleteGroupDialog = ({
  open,
  onOpenChange,
  group,
  onSuccess,
}: DeleteGroupDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteGroup } = useAdmin();

  const isConfirmed = confirmText.toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteGroup(group.id, group.group_name);
      
      if (result.success) {
        onOpenChange(false);
        setConfirmText("");
        onSuccess?.();
      }
    } finally {
      setIsDeleting(false);
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
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Permanently Delete Group
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-foreground">
                <p className="font-semibold mb-2">This will PERMANENTLY delete:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Group: <span className="font-semibold">{group.group_name}</span></li>
                  <li>{group.memberCount || 0} members will lose access</li>
                  <li>{group.contributionsCount || 0} contributions (${group.contributionsTotal?.toFixed(2) || "0.00"} total)</li>
                  <li>All payment history</li>
                </ul>
                <p className="mt-3 font-bold text-destructive">
                  This CANNOT be undone or recovered.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
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
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
