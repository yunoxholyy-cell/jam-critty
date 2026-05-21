-- JAM CRITTY initial schema

CREATE TABLE IF NOT EXISTS "registrations" (
  "id" text PRIMARY KEY,
  "full_name" text NOT NULL,
  "gender" text NOT NULL,
  "phone" text NOT NULL,
  "instagram_handle" text NOT NULL,
  "status" text NOT NULL DEFAULT 'approved',
  "payment_status" text NOT NULL DEFAULT 'unpaid',
  "payment_method" text,
  "notes" text NOT NULL DEFAULT '',
  "ticket_token" text NOT NULL UNIQUE,
  "checked_in" boolean NOT NULL DEFAULT false,
  "checked_in_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "gender_check" CHECK ("gender" IN ('female', 'male')),
  CONSTRAINT "status_check" CHECK ("status" IN ('pending', 'approved', 'rejected', 'waitlist')),
  CONSTRAINT "payment_status_check" CHECK ("payment_status" IN ('unpaid', 'pending', 'paid')),
  CONSTRAINT "payment_method_check" CHECK ("payment_method" IS NULL OR "payment_method" IN ('cash', 'ecocash'))
);

CREATE TABLE IF NOT EXISTS "event_settings" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "max_total" integer NOT NULL DEFAULT 50,
  "max_female" integer NOT NULL DEFAULT 34,
  "max_male" integer NOT NULL DEFAULT 16,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Seed the single event_settings row
INSERT INTO "event_settings" ("id", "max_total", "max_female", "max_male", "updated_at")
VALUES (1, 50, 34, 16, now())
ON CONFLICT ("id") DO NOTHING;
