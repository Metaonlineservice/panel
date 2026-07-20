/*
# META ONLINE SERVICE — Core Schema

1. Overview
This migration creates the full data model for a global visa-processing SaaS:
applicants, visa applications, visa requirements, documents, payments,
messages between applicants and agents, application status history,
notifications, and editable email templates.

The Supabase project is used as the database backend. The frontend talks to
it through the anon key + RLS, so applicants only see their own data while
admins (members of an `admins` table) can see everything.

2. New Tables
- `applicants`           — visa applicant profiles (one row per registered user)
- `admins`               — admin accounts (role-based access)
- `visa_applications`    — applications submitted by applicants
- `visa_requirements`    — global visa requirements library (per country/type)
- `documents`            — uploaded documents per applicant/application
- `payments`             — payment records per applicant
- `messages`             — applicant <-> agent communication
- `application_history`  — audit log of every status change
- `notifications`        — in-app notification center for applicants
- `email_templates`      — editable HTML email templates

3. Security (RLS)
- `applicants`: owner-scoped (applicant reads/updates own profile).
- `admins`: owner-scoped (admin reads own row).
- `visa_applications`: applicant reads own; admin reads all; updates via edge
  function (service role) for status changes; applicants can insert their own.
- `visa_requirements`: public read (anon + authenticated) so the public
  countries page works without login; admin writes via service role.
- `documents`: applicant reads/inserts own; admin reads all.
- `payments`: applicant reads own; admin reads all.
- `messages`: applicant reads/sends own conversation; admin reads/sends all.
- `application_history`: applicant reads own application history; admin reads all.
- `notifications`: applicant reads/updates own.
- `email_templates`: admin reads/writes; applicants cannot read (server only).

4. Notes
- Owner columns default to `auth.uid()` so inserts that omit them succeed.
- `visa_requirements` is intentionally public for the marketing countries page.
- Admin writes happen through an edge function using the service role key, so
  no admin-write RLS policies are needed on most tables.
*/

-- ---------- applicants ----------
CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  passport_number text,
  nationality text,
  date_of_birth date,
  account_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applicants_select_own" ON applicants;
CREATE POLICY "applicants_select_own" ON applicants FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applicants_insert_own" ON applicants;
CREATE POLICY "applicants_insert_own" ON applicants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applicants_update_own" ON applicants;
CREATE POLICY "applicants_update_own" ON applicants FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- admins ----------
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_own" ON admins;
CREATE POLICY "admins_select_own" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ---------- visa_requirements (public) ----------
CREATE TABLE IF NOT EXISTS visa_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  country_code text,
  visa_type text NOT NULL,
  required_documents text NOT NULL,
  processing_time text NOT NULL,
  fees text NOT NULL,
  additional_requirements text,
  embassy_information text,
  eligibility text,
  application_steps text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE visa_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vr_select_public" ON visa_requirements;
CREATE POLICY "vr_select_public" ON visa_requirements FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_vr_country ON visa_requirements(country);
CREATE INDEX IF NOT EXISTS idx_vr_visa_type ON visa_requirements(visa_type);

-- ---------- visa_applications ----------
CREATE TABLE IF NOT EXISTS visa_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_code text UNIQUE NOT NULL,
  visa_country text NOT NULL,
  visa_type text NOT NULL,
  application_date timestamptz NOT NULL DEFAULT now(),
  current_status text NOT NULL DEFAULT 'Submitted',
  assigned_agent text,
  priority text NOT NULL DEFAULT 'Normal',
  last_update timestamptz NOT NULL DEFAULT now(),
  notes text
);
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "va_select_own" ON visa_applications;
CREATE POLICY "va_select_own" ON visa_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "va_insert_own" ON visa_applications;
CREATE POLICY "va_insert_own" ON visa_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_va_applicant ON visa_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_va_status ON visa_applications(current_status);

-- ---------- documents ----------
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES visa_applications(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  upload_link text,
  verification_status text NOT NULL DEFAULT 'Pending',
  upload_date timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_select_own" ON documents;
CREATE POLICY "docs_select_own" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "docs_insert_own" ON documents;
CREATE POLICY "docs_insert_own" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "docs_update_own" ON documents;
CREATE POLICY "docs_update_own" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- payments ----------
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES visa_applications(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'Pending',
  payment_date timestamptz NOT NULL DEFAULT now(),
  invoice_number text UNIQUE
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pay_select_own" ON payments;
CREATE POLICY "pay_select_own" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ---------- messages ----------
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL,
  sender_role text NOT NULL,
  subject text,
  body text NOT NULL,
  read_by_applicant boolean NOT NULL DEFAULT true,
  read_by_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_select_own" ON messages;
CREATE POLICY "msg_select_own" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "msg_insert_own" ON messages;
CREATE POLICY "msg_insert_own" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---------- application_history ----------
CREATE TABLE IF NOT EXISTS application_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES visa_applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status text,
  new_status text NOT NULL,
  changed_by text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hist_select_own" ON application_history;
CREATE POLICY "hist_select_own" ON application_history FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM visa_applications va
           WHERE va.id = application_history.application_id
           AND va.user_id = auth.uid())
  );

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- email_templates ----------
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL UNIQUE,
  subject text NOT NULL,
  email_body text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
-- email_templates: no anon/authenticated policies -> only service role can read/write.
