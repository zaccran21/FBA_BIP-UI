-- basic minimal schema to get started
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  role text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text,
  student_name text,
  dob_age_grade text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indirect_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  source text,
  payload jsonb,
  created_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS header_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  header jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id uuid REFERENCES header_records(id),
  payload jsonb NOT NULL,
  totals jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id uuid REFERENCES header_records(id),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS latency_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id uuid REFERENCES header_records(id),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS abc_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id uuid REFERENCES header_records(id),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aggregated_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  summary jsonb,
  level text,
  created_at timestamptz DEFAULT now()
);

-- Create the abc_events table, linked by header_id
CREATE TABLE abc_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    header_id UUID NOT NULL REFERENCES header_records(id) ON DELETE CASCADE,
    antecedent TEXT NOT NULL,
    behavior TEXT NOT NULL,
    consequence TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster lookups based on the header ID
CREATE INDEX ON abc_events (header_id);
