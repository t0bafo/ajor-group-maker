import { useState } from "react";
import { Settings, Edit, Calendar, UserMinus, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminControlsProps {
  groupId?: string;
  groupName?: string;
  onEditContribution?: () => void;
  onAdjustDates?: () => void;
  onRemoveMember?: () => void;
  onRecalculateBalances?: () => void;
}

export const AdminControls = ({
  groupId,
  groupName,
  onEditContribution,
  onAdjustDates,
  onRemoveMember,
  onRecalculateBalances,
}: AdminControlsProps) => {
  const [open, setOpen] = useState(false);

  const handleLogData = () => {
    console.log('=== ADMIN DEBUG INFO ===');
    console.log('Group ID:', groupId);
    console.log('Group Name:', groupName);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <Settings className="h-4 w-4" />
          Admin Controls
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Controls
          </SheetTitle>
          <SheetDescription>
            Advanced actions for system administrators
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {onEditContribution && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onEditContribution();
                    setOpen(false);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Contribution
                </Button>
              )}
              {onAdjustDates && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onAdjustDates();
                    setOpen(false);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Adjust Cycle Dates
                </Button>
              )}
              {onRecalculateBalances && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onRecalculateBalances();
                    setOpen(false);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Recalculate Balances
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
            </div>
            <div className="space-y-2">
              {onRemoveMember && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    onRemoveMember();
                    setOpen(false);
                  }}
                >
                  <UserMinus className="h-4 w-4" />
                  Remove Member
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Debug Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Debug Information</h3>
            <div className="space-y-2 text-sm">
              {groupId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group ID:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {groupId.substring(0, 8)}...
                  </Badge>
                </div>
              )}
              {groupName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group Name:</span>
                  <span className="font-medium">{groupName}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleLogData}
              >
                Log Full Data to Console
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
