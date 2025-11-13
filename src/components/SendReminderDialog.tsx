import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unpaidMembers: Array<{ name: string; email: string }>;
  onConfirm: () => void;
  sending: boolean;
}

export const SendReminderDialog = ({
  open,
  onOpenChange,
  unpaidMembers,
  onConfirm,
  sending,
}: SendReminderDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <DialogTitle>Send Contribution Reminder</DialogTitle>
          </div>
          <DialogDescription>
            Send a reminder to members who haven't paid for the current cycle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Send reminder to {unpaidMembers.length} {unpaidMembers.length === 1 ? 'member' : 'members'}:
            </p>
            <div className="space-y-1">
              {unpaidMembers.map((member, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  • {member.name}
                </p>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Members will receive a reminder via their preferred notification method (SMS/Email).
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={sending}
            className="w-full sm:w-auto"
          >
            {sending ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
