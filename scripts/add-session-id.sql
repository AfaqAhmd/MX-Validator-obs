-- Add session_id column to email_records table
ALTER TABLE "email_records" ADD COLUMN IF NOT EXISTS "session_id" text NOT NULL DEFAULT '';

-- Update existing records with a default session ID if any exist
UPDATE "email_records" SET "session_id" = 'legacy_' || id::text WHERE "session_id" = '';
