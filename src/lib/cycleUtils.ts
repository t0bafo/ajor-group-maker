import { addDays, addWeeks, addMonths, startOfDay } from "date-fns";

export interface CycleData {
  cycle_number: number;
  start_date: Date;
  end_date: Date;
}

/**
 * Generate all cycles for a group based on start date, frequency, and number of members
 */
export const generateCycles = (
  startDate: string | Date,
  frequency: "weekly" | "biweekly" | "monthly",
  numberOfMembers: number
): CycleData[] => {
  const cycles: CycleData[] = [];
  let cycleStart = startOfDay(new Date(startDate));

  for (let i = 1; i <= numberOfMembers; i++) {
    let cycleEnd: Date;

    switch (frequency) {
      case "weekly":
        cycleEnd = addDays(cycleStart, 6); // 7 days total
        break;
      case "biweekly":
        cycleEnd = addDays(cycleStart, 13); // 14 days total
        break;
      case "monthly":
        cycleEnd = addDays(addMonths(cycleStart, 1), -1); // End of month
        break;
      default:
        cycleEnd = addDays(cycleStart, 6);
    }

    cycles.push({
      cycle_number: i,
      start_date: cycleStart,
      end_date: cycleEnd,
    });

    // Next cycle starts the day after current cycle ends
    switch (frequency) {
      case "weekly":
        cycleStart = addWeeks(cycleStart, 1);
        break;
      case "biweekly":
        cycleStart = addWeeks(cycleStart, 2);
        break;
      case "monthly":
        cycleStart = addMonths(cycleStart, 1);
        break;
    }
  }

  return cycles;
};

/**
 * Determine which cycle we're currently in based on today's date
 */
export const getCurrentCycleNumber = (
  startDate: string | Date,
  frequency: "weekly" | "biweekly" | "monthly",
  numberOfMembers: number
): number => {
  const cycles = generateCycles(startDate, frequency, numberOfMembers);
  const now = new Date();
  const start = new Date(startDate);

  // If Ajor hasn't started yet, return 1 so all cycles show as upcoming
  if (now < start) {
    return 1;
  }

  for (const cycle of cycles) {
    if (now >= cycle.start_date && now <= cycle.end_date) {
      return cycle.cycle_number;
    }
  }

  // If we're past all cycles, return the last cycle number
  return cycles[cycles.length - 1]?.cycle_number || 1;
};
