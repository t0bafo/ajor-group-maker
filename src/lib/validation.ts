import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email too long" });

// Group creation schema
export const groupSchema = z.object({
  groupName: z.string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  contributionAmount: z.number()
    .positive({ message: "Amount must be positive" })
    .max(100000, { message: "Amount exceeds maximum of $100,000" }),
  numberOfMembers: z.number()
    .int()
    .min(2, { message: "Minimum 2 members required" })
    .max(20, { message: "Maximum 20 members allowed" }),
  description: z.string()
    .max(500, { message: "Description too long" })
    .optional()
});

// Contribution schema
export const contributionSchema = z.object({
  amount: z.number()
    .positive({ message: "Amount must be positive" })
    .max(100000, { message: "Amount exceeds maximum of $100,000" }),
  cycle: z.number()
    .int()
    .positive({ message: "Cycle must be positive" }),
  paymentMethod: z.string()
    .min(1, { message: "Payment method is required" })
});

// Invite code schema
export const inviteCodeSchema = z.string()
  .trim()
  .length(9, { message: "Invite code must be 9 characters" })
  .regex(/^[a-z0-9]+$/, { message: "Invalid code format - use only lowercase letters and numbers" });
