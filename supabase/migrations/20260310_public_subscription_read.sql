-- Allow public read access to active subscriptions
-- This enables the search page and business public pages to show
-- "Featured" badges and do priority sorting for subscribed businesses.
-- Only active subscriptions are exposed. The server code only selects
-- tier, status, and current_period_end columns.

CREATE POLICY "Public can view active subscriptions"
  ON subscriptions FOR SELECT
  USING (status = 'active');
