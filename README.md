# Clinic Appointment Scheduler 

A production-shaped clinic appointment scheduler built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod.

Tech Stack
Frontend & Backend: Next.js (TypeScript, React, Tailwind CSS)

Database & ORM: PostgreSQL with Prisma

Validation: Zod

Features
Patient Portal: Browse doctors by specialization, choose a date, view real-time open time slots, and book appointments with a reason.

Doctor Availability: Store recurring weekday schedules as minute ranges. The API only exposes open 45-minute slots inside those schedules.

Concurrency Control: Robust database-level transaction management to completely eliminate overlapping schedules and double-bookings.

Responsive GUI: Mobile-friendly, accessible interface built for cross-platform usage.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database.
3. Generate the client and run the overlap-protection migration: `npm run db:generate` then `npm run db:migrate -- --name init`.
4. Optionally seed the sample doctors with `npm run db:seed`.
5. Start the app with `npm run dev`.

## Manage doctors and schedules in Supabase

Doctor details and recurring availability are stored in PostgreSQL. If you are using Supabase's CSV import, upload [supabase/Doctor.csv](supabase/Doctor.csv) into the `Doctor` table first, then upload [supabase/DoctorAvailability.csv](supabase/DoctorAvailability.csv) into the `DoctorAvailability` table.

Upload the `Doctor` CSV before the availability CSV because availability rows reference doctors through `doctorId`. The SQL version is also available at [supabase/doctor-data.sql](supabase/doctor-data.sql) for Supabase's SQL Editor.

If booking returns a generic creation error, run [supabase/repair-appointment-schema.sql](supabase/repair-appointment-schema.sql) once in Supabase SQL Editor. It adds the appointment message column and the database overlap protection if they are missing.

Edit the `Doctor` table for doctor names and specializations. Edit the `DoctorAvailability` table for schedules. Each availability row belongs to a doctor through `doctorId`:

- `dayOfWeek`: `0` Sunday through `6` Saturday
- `startMinute`: minutes after midnight, so 3:00 PM is `900`
- `endMinute`: minutes after midnight, so 6:00 PM is `1080`

For example, Wednesday from 3:00 PM to 6:00 PM is a `DoctorAvailability` row with `dayOfWeek = 3`, `startMinute = 900`, and `endMinute = 1080`. Changes made in the Supabase SQL Editor are read by the booking API from the database and apply without changing source code or reseeding.

## API surface

- `GET /api/doctors?specialization=Cardiology` filters doctors.
- `GET /api/doctors` returns doctors together with their database-managed availability rows.
- `GET /api/doctors/:doctorId/availability?date=2026-09-14` calculates open 45-minute slots from the doctor's weekly schedule and existing bookings.
- `POST /api/appointments` validates and creates a patient appointment in a serializable transaction.

PostgreSQL's `btree_gist` exclusion constraint prevents overlapping `SCHEDULED` appointments for the same doctor even under concurrent requests.


Important facts: This is a sample project with production level server management. But this has 0 Security, I've left the Api, links, passwords directly inside the repo intentionally. That should be for learning help and not misuse.

Made by Tamzid Idrish.
