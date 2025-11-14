// Utility functions for date calculations in Ajor cycles

export interface CycleInfo {
  cycleNumber: number;
  cycleLabel: string;
  startDate: Date;
  dueDate: Date;
  endDate: Date;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Calculates cycle dates and status for a given cycle number
 */
export function calculateCycleDates(
  startDate: string | Date,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
  cycleNumber: number
): CycleInfo {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  let cycleStart = new Date(start);
  let cycleEnd = new Date(start);
  
  switch (frequency) {
    case 'weekly':
      cycleStart.setDate(start.getDate() + (cycleNumber - 1) * 7);
      cycleEnd.setDate(cycleStart.getDate() + 7);
      break;
    case 'biweekly':
      cycleStart.setDate(start.getDate() + (cycleNumber - 1) * 14);
      cycleEnd.setDate(cycleStart.getDate() + 14);
      break;
    case 'monthly':
      cycleStart.setMonth(start.getMonth() + (cycleNumber - 1));
      cycleEnd.setMonth(cycleStart.getMonth() + 1);
      break;
    case 'quarterly':
      cycleStart.setMonth(start.getMonth() + (cycleNumber - 1) * 3);
      cycleEnd.setMonth(cycleStart.getMonth() + 3);
      break;
  }
  
  // Due date is at the end of the cycle period
  const dueDate = new Date(cycleEnd);
  dueDate.setDate(dueDate.getDate() - 1);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return {
    cycleNumber,
    cycleLabel: getCycleLabel(frequency, cycleNumber, cycleStart),
    startDate: cycleStart,
    dueDate,
    endDate: cycleEnd,
    isActive: now >= cycleStart && now < cycleEnd,
    isPast: now >= cycleEnd,
    isFuture: now < cycleStart,
  };
}

/**
 * Gets a human-readable label for a cycle
 */
export function getCycleLabel(
  frequency: string,
  cycleNumber: number,
  cycleStart: Date
): string {
  switch (frequency) {
    case 'weekly':
      return `Week ${cycleNumber}`;
    case 'biweekly':
      return `Period ${cycleNumber}`;
    case 'monthly':
      return cycleStart.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    case 'quarterly':
      return `Q${Math.ceil((cycleStart.getMonth() + 1) / 3)} ${cycleStart.getFullYear()}`;
    default:
      return `Cycle ${cycleNumber}`;
  }
}

/**
 * Gets the current active cycle, or null if Ajor hasn't started
 */
export function getCurrentCycleInfo(
  startDate: string | Date | null,
  frequency: string,
  maxCycles: number
): CycleInfo | null {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // If Ajor hasn't started yet, return null
  if (now < start) return null;
  
  // Find the current active cycle
  for (let i = 1; i <= maxCycles; i++) {
    const cycle = calculateCycleDates(start, frequency as any, i);
    if (cycle.isActive) return cycle;
  }
  
  return null;
}

/**
 * Legacy function for backwards compatibility - returns cycle number or null
 */
export function getCurrentCycle(startDate: string | Date | null, frequency: string): number | null {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // If Ajor hasn't started yet, return null
  if (now < start) return null;
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case "weekly":
      return Math.floor(diffDays / 7) + 1;
    case "biweekly":
      return Math.floor(diffDays / 14) + 1;
    case "monthly":
      return Math.floor(diffDays / 30) + 1;
    default:
      return 1;
  }
}

/**
 * Gets due date for a specific cycle
 */
export function getDueDateForCycle(
  startDate: string | Date,
  frequency: string,
  cycle: number | null
): Date {
  if (cycle === null) {
    // Return far future date if no cycle
    return new Date('2099-12-31');
  }
  
  const start = new Date(startDate);
  const dueDate = new Date(start);
  
  switch (frequency) {
    case "weekly":
      dueDate.setDate(start.getDate() + (cycle * 7) - 1);
      break;
    case "biweekly":
      dueDate.setDate(start.getDate() + (cycle * 14) - 1);
      break;
    case "monthly":
      dueDate.setMonth(start.getMonth() + cycle);
      dueDate.setDate(0); // Last day of previous month
      break;
    case "quarterly":
      dueDate.setMonth(start.getMonth() + (cycle * 3));
      dueDate.setDate(0);
      break;
  }
  
  return dueDate;
}

/**
 * Gets days until due date (negative if overdue)
 * Returns 0 on the due date itself, negative only after due date has passed
 */
export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  // Use Math.floor for negative numbers to ensure we only go negative after the full day has passed
  const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Gets days overdue (0 if not overdue, positive number if overdue)
 */
export function getDaysOverdue(dueDate: Date): number {
  const daysUntil = getDaysUntilDue(dueDate);
  return daysUntil < 0 ? Math.abs(daysUntil) : 0;
}

/**
 * Gets human-readable due date label
 */
export function getDueDateLabel(dueDate: Date): string {
  const daysUntil = getDaysUntilDue(dueDate);
  
  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
  }
  
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  if (daysUntil <= 7) return `Due in ${daysUntil} days`;
  
  return `Due ${dueDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;
}

/**
 * Checks if payment was late considering grace period
 */
export function isPaymentLate(paidAt: Date, dueDate: Date, gracePeriodDays: number = 3): boolean {
  const gracePeriodEnd = new Date(dueDate);
  gracePeriodEnd.setDate(dueDate.getDate() + gracePeriodDays);
  return paidAt > gracePeriodEnd;
}
