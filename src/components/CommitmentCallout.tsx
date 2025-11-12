import { Lock, Shield, Users, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const CommitmentCallout = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-cta/5 to-accent/5 border-primary/20 shadow-[var(--shadow-medium)] p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-cta to-accent flex items-center justify-center shadow-sm">
            <Lock className="h-6 w-6 text-card" />
          </div>
          <h3 className="text-2xl font-bold">Commitment is Key</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Everyone pays for the FULL duration</p>
              <p className="text-sm text-muted-foreground">Even after receiving your payout, you continue contributing until the cycle ends</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Only invite trusted people</p>
              <p className="text-sm text-muted-foreground">This works best with friends, family, and close colleagues you trust</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Built on mutual accountability</p>
              <p className="text-sm text-muted-foreground">The host manages the group, but everyone is responsible for keeping their commitment</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground italic">
            Ajor is rooted in cultural practices like <span className="font-semibold text-foreground">ajo</span> and <span className="font-semibold text-foreground">susu</span>—traditions built on trust and community support.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CommitmentCallout;
