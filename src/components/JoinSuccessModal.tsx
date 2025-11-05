import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PartyPopper } from "lucide-react";

interface JoinSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onContinue: () => void;
}

const JoinSuccessModal = ({ open, onOpenChange, groupName, onContinue }: JoinSuccessModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 relative animate-scale-in">
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            <div className="absolute -top-2 -right-2">
              <PartyPopper className="h-6 w-6 text-accent animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to {groupName}!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You've successfully joined this Ajor group
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <p className="text-sm text-muted-foreground text-center">
              You'll receive a confirmation email with all the group details and your first 
              contribution date. Check your group dashboard to see when it's your turn to receive the payout.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="hero" onClick={onContinue} className="w-full" size="lg">
            Go to Group Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinSuccessModal;
