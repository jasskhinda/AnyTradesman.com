-- Track whether a subscription is set to cancel at the end of the current period.
--
-- When a customer cancels through the Stripe billing portal, Stripe does NOT
-- delete the subscription immediately — it keeps it `active` and sets
-- cancel_at_period_end = true until the period ends. Without storing this flag
-- the app cannot tell "active and renewing" apart from "active but canceling",
-- so it wrongly shows "Renews <date>" for a subscription that is winding down.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> paste -> Run).

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
