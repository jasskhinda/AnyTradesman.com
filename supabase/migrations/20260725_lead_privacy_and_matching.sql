-- Lead system hardening: keep customer contact details private until a
-- business actually quotes, and let the app record matched leads.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> paste -> Run).

-- ---------------------------------------------------------------------------
-- 1) Helper: am I an admin?
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER so it bypasses RLS. Querying profiles directly inside a
-- policy ON profiles would recurse (the same failure mode as the earlier
-- service_requests/quotes recursion).

CREATE OR REPLACE FUNCTION public.rls_is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.rls_is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.rls_is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2) profiles: stop exposing every customer's email and phone to everyone
-- ---------------------------------------------------------------------------
-- The old policy was USING (true), so any signed-in business could read any
-- customer's email/phone straight from the API without ever sending a quote,
-- which defeated the whole "contact details unlock after you quote" model.
-- Server routes that legitimately need contact details (e.g. showing the
-- customer to a business that has quoted) use the service-role key and are
-- unaffected by RLS.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    -- your own profile
    id = auth.uid()
    -- admins
    OR public.rls_is_admin()
    -- owners of active businesses back the public business listings
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.owner_id = profiles.id AND b.is_active = true
    )
    -- the customer in a conversation your business is part of
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.businesses b ON b.id = c.business_id
      WHERE c.customer_id = profiles.id AND b.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3) leads: allow the app to materialize matches and track views
-- ---------------------------------------------------------------------------
-- Rows are written by server routes using the service-role key, but an INSERT
-- policy makes the intent explicit and supports any authenticated path.

DROP POLICY IF EXISTS "Businesses can record their own leads" ON public.leads;
CREATE POLICY "Businesses can record their own leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = leads.business_id AND owner_id = auth.uid()
    )
  );

-- Customers can see the anonymous reach of their own request (how many
-- businesses it went to, how many viewed it) without learning who they are.
DROP POLICY IF EXISTS "Customers can see reach of their requests" ON public.leads;
CREATE POLICY "Customers can see reach of their requests"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = leads.service_request_id AND sr.customer_id = auth.uid()
    )
  );
