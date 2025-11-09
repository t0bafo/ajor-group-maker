import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GripVertical, Info } from "lucide-react";
import { LoadingButton } from "./LoadingButton";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface ReorderMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  onConfirm: (reorderedMembers: Member[]) => void;
  loading?: boolean;
}

const ReorderMembersModal = ({
  open,
  onOpenChange,
  members,
  onConfirm,
  loading = false,
}: ReorderMembersModalProps) => {
  const [orderedMembers, setOrderedMembers] = useState<Member[]>(members);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMembers = [...orderedMembers];
    const draggedMember = newMembers[draggedIndex];
    newMembers.splice(draggedIndex, 1);
    newMembers.splice(index, 0, draggedMember);
    
    setOrderedMembers(newMembers);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleConfirm = () => {
    onConfirm(orderedMembers);
  };

  const handleCancel = () => {
    setOrderedMembers(members);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Arrange Payout Order</DialogTitle>
          <DialogDescription>
            Drag and drop to set the order in which members will receive payouts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              The first member will receive the first payout, the second member the second payout, and so on.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {orderedMembers.map((member, index) => (
              <div
                key={member.id}
                draggable={!loading}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 cursor-move transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-95' : 'hover:bg-secondary/70 hover:border-primary/30'
                }`}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Confirm Order
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReorderMembersModal;
