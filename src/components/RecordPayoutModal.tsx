import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface RecordPayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string | number;
    name: string;
    email: string;
    position: number;
  };
  amount: number;
  cycle: number;
  groupName: string;
  onConfirm: (note: string, notifyRecipient: boolean, notifyGroup: boolean) => void;
}

const RecordPayoutModal = ({
  open,
  onOpenChange,
  member,
  amount,
  cycle,
  groupName,
  onConfirm,
}: RecordPayoutModalProps) => {
  const [note, setNote] = useState("");
  const [notifyRecipient, setNotifyRecipient] = useState(true);
  const [notifyGroup, setNotifyGroup] = useState(true);
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm(note, notifyRecipient, notifyGroup);
    setNote("");
    setNotifyRecipient(true);
    setNotifyGroup(true);
    onOpenChange(false);
    
    toast({
      title: "Payout Recorded!",
      description: `${member.name} has received their payout of $${amount.toFixed(2)}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Payout</DialogTitle>
          <DialogDescription>
            Record payout details for {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Member</p>
              <p className="font-semibold">{member.name}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Position</p>
              <p className="font-semibold">#{member.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="font-semibold text-lg">${amount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Cycle</p>
              <p className="font-semibold">Cycle {cycle}</p>
            </div>
          </div>

          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Date</p>
            <p className="font-semibold">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payout-note">Note (Optional)</Label>
            <Textarea
              id="payout-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Payment sent via Zelle, Manual handoff confirmed..."
              rows={3}
            />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium">Notifications</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-recipient"
                checked={notifyRecipient}
                onCheckedChange={(checked) => setNotifyRecipient(checked as boolean)}
              />
              <Label
                htmlFor="notify-recipient"
                className="text-sm font-normal cursor-pointer"
              >
                Notify recipient via SMS
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-group"
                checked={notifyGroup}
                onCheckedChange={(checked) => setNotifyGroup(checked as boolean)}
              />
              <Label
                htmlFor="notify-group"
                className="text-sm font-normal cursor-pointer"
              >
                Notify group via email
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setNote("");
              setNotifyRecipient(true);
              setNotifyGroup(true);
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            Confirm Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPayoutModal;
