import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, CheckCircle } from "lucide-react";

interface ArchiveGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  isArchived: boolean;
  onConfirm: () => void;
}

const ArchiveGroupModal = ({ open, onOpenChange, groupName, isArchived, onConfirm }: ArchiveGroupModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Archive className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <DialogTitle>{isArchived ? "Unarchive" : "Archive"} This Ajor?</DialogTitle>
            </div>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              You are about to {isArchived ? "unarchive" : "archive"} <strong>{groupName}</strong>.
            </p>
            {isArchived ? (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>Group will be restored to active groups</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>You can resume adding contributions and payouts</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>All history and members will remain intact</p>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>All transaction history will be preserved</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>Group ledger remains viewable</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>Group moves to archived section</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p>No new contributions or payouts can be added</p>
                </div>
              </div>
            )}
            <p className="text-muted-foreground">
              This action can be reversed by {isArchived ? "archiving" : "unarchiving"} the group later.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-accent hover:bg-accent/90">
            <Archive className="mr-2 h-4 w-4" />
            {isArchived ? "Unarchive" : "Archive"} Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveGroupModal;
