-- Add plan_id column to track the exact pricing plan (beta, monthly, sixMonth, yearly)
-- This is separate from "tier" which tracks the feature tier (basic, professional, enterprise)
-- Needed to distinguish between monthly and sixMonth which are both "professional" tier

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT;
