import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, DollarSign, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupData: any;
  members: any[];
}

const ConfirmationModal = ({ open, onOpenChange, groupData, members }: ConfirmationModalProps) => {
  const handleConfirm = () => {
    toast({
      title: "Your Ajor has been created! 🎉",
      description: "Start inviting members and building your savings community",
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Confirm Your Ajor Setup
          </DialogTitle>
          <DialogDescription className="text-center">
            Review your group details before finalizing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Group Name</p>
                <p className="font-semibold">{groupData.groupName || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contribution</p>
                <p className="font-semibold">
                  ${groupData.contributionAmount || 0} 
                  <span className="text-sm text-muted-foreground ml-1 capitalize">
                    ({groupData.frequency || "—"})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-semibold">
                  {members.length} of {groupData.numberOfMembers || 0} joined
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Rotation:</strong> {groupData.rotationOrder === "sequential" ? "Sequential" : "Random"} order
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Review Details
          </Button>
          <Button variant="hero" onClick={handleConfirm} className="w-full sm:w-auto">
            Confirm & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
