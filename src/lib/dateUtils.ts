// Utility functions for date calculations in Ajor cycles

export function getDueDateForCycle(
  startDate: string | Date,
  frequency: string,
  cycle: number
): Date {
  const start = new Date(startDate);
  const dueDate = new Date(start);
  
  switch (frequency) {
    case "weekly":
      dueDate.setDate(start.getDate() + ((cycle - 1) * 7));
      break;
    case "biweekly":
      dueDate.setDate(start.getDate() + ((cycle - 1) * 14));
      break;
    case "monthly":
      dueDate.setMonth(start.getMonth() + (cycle - 1));
      break;
  }
  
  return dueDate;
}

export function getCurrentCycle(startDate: string | Date, frequency: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
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

export function isPaymentLate(paidAt: Date, dueDate: Date, gracePeriodDays: number = 3): boolean {
  const gracePeriodEnd = new Date(dueDate);
  gracePeriodEnd.setDate(dueDate.getDate() + gracePeriodDays);
  return paidAt > gracePeriodEnd;
}

export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysOverdue(dueDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
