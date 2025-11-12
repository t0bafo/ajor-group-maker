-- Add SMS notification preferences to notification_preferences table
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS sms_notifications boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_contribution_reminders boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_payout_notifications boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_member_activity boolean NOT NULL DEFAULT true;