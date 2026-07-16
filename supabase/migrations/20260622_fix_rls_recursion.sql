-- Fix: "infinite recursion detected in policy for relation service_requests"
--
-- The SELECT policy on service_requests referenced quotes, and the SELECT
-- policy on quotes referenced service_requests. Each subquery re-applies the
-- other table's RLS, so Postgres aborts every SELECT on either table with a
-- recursion error. This broke My Requests, Leads, My Quotes, request details,
-- and the customer dashboard for all users.
--
-- Fix: move the cross-table checks into SECURITY DEFINER functions (which
-- bypass RLS inside the policy check), then recreate non-recursive policies.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> paste -> Run).

-- 1) Helper functions -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rls_is_request_owner(req_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM service_requests
    WHERE id = req_id AND customer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.rls_owns_business_with_quote_on(req_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM quotes q
    JOIN businesses b ON b.id = q.business_id
    WHERE q.service_request_id = req_id
      AND b.owner_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.rls_is_request_owner(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.rls_owns_business_with_quote_on(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.rls_is_request_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_owns_business_with_quote_on(uuid) TO authenticated;

-- 2) Drop every existing SELECT policy on the two tables (names may have
--    drifted from schema.sql, so drop whatever is there) ---------------------

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('service_requests', 'quotes')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3) Recreate non-recursive SELECT policies ---------------------------------

-- Customers see their own requests; any authenticated user can see open
-- requests (needed for the business leads feed); businesses see requests
-- they have quoted on (via the definer function, no recursion).
CREATE POLICY "service_requests_select"
  ON public.service_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR status = 'open'
    OR public.rls_owns_business_with_quote_on(id)
  );

-- Request owners and the quoting business can see a quote.
CREATE POLICY "quotes_select"
  ON public.quotes FOR SELECT
  USING (
    public.rls_is_request_owner(service_request_id)
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );
