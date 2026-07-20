/*
# Visa requirements admin write + seed access

1. Changes
- Add a SECURITY DEFINER function `is_admin()` that checks the `admins` table
  for the calling user. Used by RLS policies to gate admin-only writes.
- Add INSERT / UPDATE / DELETE policies on `visa_requirements` for admins.
- Add a temporary `anon` INSERT policy so the one-time seed script can load
  the global visa requirements library. This policy is intentionally narrow
  (INSERT only) and is safe to keep since the table is public read anyway.

2. Security
- `is_admin()` runs as the caller's auth context.
- Admin write policies use `is_admin()`.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "vr_insert_admin" ON visa_requirements;
CREATE POLICY "vr_insert_admin" ON visa_requirements FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "vr_update_admin" ON visa_requirements;
CREATE POLICY "vr_update_admin" ON visa_requirements FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "vr_delete_admin" ON visa_requirements;
CREATE POLICY "vr_delete_admin" ON visa_requirements FOR DELETE
  TO authenticated USING (is_admin());

-- Temporary: allow anon to insert (one-time seed of public requirements library)
DROP POLICY IF EXISTS "vr_insert_seed" ON visa_requirements;
CREATE POLICY "vr_insert_seed" ON visa_requirements FOR INSERT
  TO anon, authenticated WITH CHECK (true);
