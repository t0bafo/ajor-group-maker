import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";

const AjorCalculator = () => {
  const [members, setMembers] = useState(6);
  const [contribution, setContribution] = useState(50);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");

  const totalPot = members * contribution;
  const totalInvestment = contribution * members;
  
  const getDuration = () => {
    if (frequency === "weekly") return `${members} weeks`;
    if (frequency === "biweekly") return `${members * 2} weeks`;
    return `${members} months`;
  };

  const getFrequencyLabel = () => {
    if (frequency === "weekly") return "Every week";
    if (frequency === "biweekly") return "Every 2 weeks";
    return "Every month";
  };

  return (
    <Card className="p-8 bg-card border-border/50 shadow-[var(--shadow-large)]">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">See How It Works</h3>
          <p className="text-muted-foreground">
            Adjust the values to see your potential savings
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          {/* Number of Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Number of Members
              </label>
              <span className="text-sm font-semibold text-primary">{members}</span>
            </div>
            <Slider
              value={[members]}
              onValueChange={([value]) => setMembers(value)}
              min={4}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Minimum 4, maximum 20 members</p>
          </div>

          {/* Contribution Amount */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Contribution Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(Math.max(10, Math.min(1000, Number(e.target.value))))}
                min={10}
                max={1000}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter amount between $10-$1000</p>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Frequency
            </label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (52 times/year)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 times/year)</SelectItem>
                <SelectItem value="monthly">Monthly (12 times/year)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Outputs */}
        <div className="pt-6 border-t border-border/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Total Pot per Cycle</p>
              <p className="text-2xl font-bold text-primary">${totalPot}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold text-foreground">{getDuration()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Your Total Investment</p>
              <p className="text-2xl font-bold text-foreground">${totalInvestment}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Your Payout</p>
              <p className="text-2xl font-bold text-accent">${totalPot}</p>
            </div>
          </div>

          {/* Timeline Visualization */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Payout Timeline</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: members }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary via-cta to-accent flex items-center justify-center text-card font-semibold text-sm shadow-sm"
                  title={`Week ${i + 1}: Member ${i + 1} receives $${totalPot}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Each box = one {frequency === "monthly" ? "month" : "cycle"}. Everyone contributes <span className="font-semibold">${contribution}</span> {getFrequencyLabel().toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AjorCalculator;
