/*
# Remove temporary anon seed insert policy on visa_requirements

The one-time seed of the public visa requirements library is complete.
Drop the `vr_insert_seed` policy so anon can no longer insert into the table.
Admin inserts (via `is_admin()`) remain available.
*/
DROP POLICY IF EXISTS "vr_insert_seed" ON visa_requirements;
