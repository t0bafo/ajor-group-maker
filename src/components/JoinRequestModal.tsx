import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClockIcon } from "lucide-react";
import { useState } from "react";

interface JoinRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  hostName: string;
  onSubmit: (message: string) => void;
  loading?: boolean;
}

const JoinRequestModal = ({ 
  open, 
  onOpenChange, 
  groupName, 
  hostName,
  onSubmit,
  loading = false
}: JoinRequestModalProps) => {
  const [joinMessage, setJoinMessage] = useState("");

  const handleSubmit = () => {
    onSubmit(joinMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 animate-scale-in">
            <ClockIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Request to Join {groupName}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {hostName} will review your request before you can join
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinMessage" className="text-sm font-medium">
              Why do you want to join? (Optional)
            </Label>
            <Textarea
              id="joinMessage"
              placeholder="Tell the host why you'd like to join this group..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              className="resize-none h-24"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {joinMessage.length}/500 characters
            </p>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What happens next:</strong><br />
              • Your request will be sent to {hostName}<br />
              • You'll receive an email when it's reviewed<br />
              • If approved, you'll be able to access the group
            </p>
          </div>
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
          <Button 
            variant="hero" 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Submitting..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRequestModal;
