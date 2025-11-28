import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";

interface UnpaidMember {
  id?: string;
  name: string;
  email: string;
}

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unpaidMembers: UnpaidMember[];
  onConfirm: (selectedMembers: UnpaidMember[]) => void;
  sending: boolean;
}

export const SendReminderDialog = ({
  open,
  onOpenChange,
  unpaidMembers,
  onConfirm,
  sending,
}: SendReminderDialogProps) => {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Initialize all members as selected when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMembers(new Set(unpaidMembers.map(m => m.email)));
    }
  }, [open, unpaidMembers]);

  const toggleMember = (email: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedMembers(newSelected);
  };

  const toggleAll = () => {
    if (selectedMembers.size === unpaidMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(unpaidMembers.map(m => m.email)));
    }
  };

  const handleConfirm = () => {
    const membersToNotify = unpaidMembers.filter(m => selectedMembers.has(m.email));
    onConfirm(membersToNotify);
  };

  const selectedCount = selectedMembers.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <DialogTitle>Send Contribution Reminder</DialogTitle>
          </div>
          <DialogDescription>
            Select members to send a payment reminder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                {selectedCount} of {unpaidMembers.length} {unpaidMembers.length === 1 ? 'member' : 'members'} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="text-xs h-7 px-2"
              >
                {selectedMembers.size === unpaidMembers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-2">
              {unpaidMembers.map((member) => (
                <div 
                  key={member.email} 
                  className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-secondary/50 cursor-pointer"
                  onClick={() => toggleMember(member.email)}
                >
                  <Checkbox
                    checked={selectedMembers.has(member.email)}
                    onCheckedChange={() => toggleMember(member.email)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Selected members will receive a reminder via their preferred notification method (SMS/Email).
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
            onClick={handleConfirm} 
            disabled={sending || selectedCount === 0}
            className="w-full sm:w-auto"
          >
            {sending ? "Sending..." : `Send to ${selectedCount} ${selectedCount === 1 ? 'Member' : 'Members'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
