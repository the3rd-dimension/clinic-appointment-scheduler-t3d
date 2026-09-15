-- Paste this file into the Supabase SQL Editor.
-- Run the Doctor upsert first, then replace that doctor's availability rows.
-- dayOfWeek: 0 Sunday, 1 Monday, 2 Tuesday, 3 Wednesday,
--             4 Thursday, 5 Friday, 6 Saturday.
-- startMinute/endMinute are minutes after midnight.
-- 3:00 PM = 900, 6:00 PM = 1080.

INSERT INTO "Doctor" ("id", "name", "specialization", "createdAt", "updatedAt")
VALUES
  ('dr-alexandra-chen', 'Dr. Alexandra Chen', 'Cardiology', NOW(), NOW()),
  ('dr-marcus-wright', 'Dr. Marcus Wright', 'General medicine', NOW(), NOW()),
  ('dr-leila-hassan', 'Dr. Leila Hassan', 'Dermatology', NOW(), NOW()),
  ('dr-tamzid-idrish', 'Tamzid Idrish', 'Computer Health', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "specialization" = EXCLUDED."specialization",
  "updatedAt" = NOW();

-- Example: Dr. Alexandra Chen is available Wednesday through Monday,
-- from 3:00 PM to 6:00 PM. Delete and replace this doctor's schedule
-- whenever you want to change it.
BEGIN;

DELETE FROM "DoctorAvailability"
WHERE "doctorId" = 'dr-alexandra-chen';

INSERT INTO "DoctorAvailability"
  ("id", "doctorId", "dayOfWeek", "startMinute", "endMinute", "createdAt", "updatedAt")
VALUES
  ('dr-alexandra-chen-sun-1500', 'dr-alexandra-chen', 0, 900, 1080, NOW(), NOW()),
  ('dr-alexandra-chen-mon-1500', 'dr-alexandra-chen', 1, 900, 1080, NOW(), NOW()),
  ('dr-alexandra-chen-wed-1500', 'dr-alexandra-chen', 3, 900, 1080, NOW(), NOW()),
  ('dr-alexandra-chen-thu-1500', 'dr-alexandra-chen', 4, 900, 1080, NOW(), NOW()),
  ('dr-alexandra-chen-fri-1500', 'dr-alexandra-chen', 5, 900, 1080, NOW(), NOW()),
  ('dr-alexandra-chen-sat-1500', 'dr-alexandra-chen', 6, 900, 1080, NOW(), NOW());

COMMIT;

-- Copy the DELETE and INSERT pattern above for another doctor.
-- Example for Dr. Marcus Wright, Monday to Friday, 9:00 AM to 1:00 PM:
--
-- BEGIN;
-- DELETE FROM "DoctorAvailability" WHERE "doctorId" = 'dr-marcus-wright';
-- INSERT INTO "DoctorAvailability"
--   ("id", "doctorId", "dayOfWeek", "startMinute", "endMinute", "createdAt", "updatedAt")
-- VALUES
--   ('dr-marcus-wright-mon-0900', 'dr-marcus-wright', 1, 540, 780, NOW(), NOW()),
--   ('dr-marcus-wright-tue-0900', 'dr-marcus-wright', 2, 540, 780, NOW(), NOW()),
--   ('dr-marcus-wright-wed-0900', 'dr-marcus-wright', 3, 540, 780, NOW(), NOW()),
--   ('dr-marcus-wright-thu-0900', 'dr-marcus-wright', 4, 540, 780, NOW(), NOW()),
--   ('dr-marcus-wright-fri-0900', 'dr-marcus-wright', 5, 540, 780, NOW(), NOW());
-- COMMIT;
