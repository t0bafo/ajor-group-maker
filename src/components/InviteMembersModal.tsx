import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InviteMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  inviteCode: string;
}

const InviteMembersModal = ({ open, onOpenChange, groupName, inviteCode }: InviteMembersModalProps) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "✅ Link copied",
      description: "Send it to your group.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "✅ Code copied",
      description: "Share it with your circle.",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `Join ${groupName} on Ajor`,
      text: `You're invited to join "${groupName}" — a trusted savings circle. Use code: ${inviteCode}`,
      url: inviteLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-gold/20 shadow-[var(--shadow-elegant)]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invite Members</DialogTitle>
          <DialogDescription>
            Share your link or code to invite trusted members to "{groupName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Invite Link Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Share this link
            </Label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="font-mono text-sm bg-background/80 border-gold/20"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="shrink-0 border-gold/20 hover:bg-gold/10"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or share this code</span>
            </div>
          </div>

          {/* Join Code Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Join Code
            </Label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-br from-gold/10 to-accent/10 border border-gold/30 flex items-center justify-center">
                <span className="text-2xl font-bold font-mono tracking-widest text-foreground">
                  {inviteCode}
                </span>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="icon"
                className="shrink-0 h-auto border-gold/20 hover:bg-gold/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-gold/20 hover:bg-gold/10"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button
              onClick={handleShare}
              variant="cta"
              className="bg-gradient-to-r from-accent to-primary"
            >
              <Mail className="mr-2 h-4 w-4" />
              Share via...
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground italic pt-2">
          "It takes a village to save."
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersModal;
