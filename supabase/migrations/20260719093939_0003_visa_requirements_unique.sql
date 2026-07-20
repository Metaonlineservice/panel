/*
# Unique constraint on visa_requirements (country, visa_type)

Adds a unique constraint so upserts/seeds on (country, visa_type) work via
the PostgREST `on_conflict` parameter.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_vr_country_visa_type'
  ) THEN
    ALTER TABLE visa_requirements
      ADD CONSTRAINT uq_vr_country_visa_type UNIQUE (country, visa_type);
  END IF;
END $$;
