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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'approve' | 'reject';
  memberName: string;
  onConfirm: (data: { message?: string; reason?: string }) => Promise<void>;
}

const REJECTION_REASONS = [
  { value: "group_full", label: "Group is full" },
  { value: "dont_know", label: "Don't know this person" },
  { value: "not_fit", label: "Not a good fit" },
  { value: "other", label: "Other (please explain)" },
];

const ApprovalModal = ({ 
  open, 
  onOpenChange, 
  action,
  memberName,
  onConfirm
}: ApprovalModalProps) => {
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isApprove = action === 'approve';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isApprove) {
        await onConfirm({ message });
      } else {
        const finalReason = rejectionReason === 'other' 
          ? customReason 
          : REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason;
        await onConfirm({ reason: finalReason });
      }
      onOpenChange(false);
      // Reset state
      setMessage("");
      setRejectionReason("");
      setCustomReason("");
    } catch (error) {
      console.error('Error in approval modal:', error);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = isApprove || (rejectionReason && (rejectionReason !== 'other' || customReason.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-scale-in ${
            isApprove 
              ? 'bg-gradient-to-br from-emerald to-emerald/80' 
              : 'bg-gradient-to-br from-destructive to-destructive/80'
          }`}>
            {isApprove ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : (
              <XCircle className="h-8 w-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {isApprove ? 'Approve' : 'Reject'} {memberName}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isApprove 
              ? 'Welcome this member to your group'
              : 'This will decline their join request'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isApprove ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-sm font-medium">
                  Welcome Message (Optional)
                </Label>
                <Textarea
                  id="welcomeMessage"
                  placeholder="Welcome to the group! Looking forward to saving together..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none h-24"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/300 characters
                </p>
              </div>
              <div className="bg-emerald/10 rounded-lg p-4 border border-emerald/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">After approval:</strong><br />
                  • {memberName} will be added to the group<br />
                  • They'll receive a welcome email<br />
                  • They can access the group dashboard
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  Reason for Rejection <span className="text-destructive">*</span>
                </Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECTION_REASONS.map(reason => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rejectionReason === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customReason" className="text-sm font-medium">
                    Please explain <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="customReason"
                    placeholder="Please provide a reason for rejection..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="resize-none h-20"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customReason.length}/200 characters
                  </p>
                </div>
              )}

              <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">After rejection:</strong><br />
                  • {memberName}'s request will be declined<br />
                  • They'll see the status in their dashboard<br />
                  • The invite code remains active for others
                </p>
              </div>
            </>
          )}
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
            variant={isApprove ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className={isApprove ? "w-full sm:w-auto bg-emerald hover:bg-emerald/90" : "w-full sm:w-auto"}
          >
            {loading ? "Processing..." : isApprove ? "Approve Member" : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;
