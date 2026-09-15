-- Run this once in Supabase SQL Editor if booking returns:
-- "We could not create the appointment. Please try again."
-- It brings the Appointment table in line with the current app schema.

ALTER TABLE "Appointment"
ADD COLUMN IF NOT EXISTS "message" TEXT NOT NULL DEFAULT '';

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Appointment_doctor_time_no_overlap'
  ) THEN
    ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_doctor_time_no_overlap"
    EXCLUDE USING gist (
      "doctorId" WITH =,
      tsrange("startTime", "endTime", '[)') WITH &&
    )
    WHERE ("status" = 'SCHEDULED');
  END IF;
END $$;
