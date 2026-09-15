ALTER TABLE "Appointment"
ADD COLUMN "message" TEXT NOT NULL DEFAULT '';

CREATE TABLE "DoctorAvailability" (
  "id" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startMinute" INTEGER NOT NULL,
  "endMinute" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DoctorAvailability_doctorId_dayOfWeek_startMinute_endMinute_key"
ON "DoctorAvailability"("doctorId", "dayOfWeek", "startMinute", "endMinute");

CREATE INDEX "DoctorAvailability_doctorId_dayOfWeek_idx"
ON "DoctorAvailability"("doctorId", "dayOfWeek");

ALTER TABLE "DoctorAvailability"
ADD CONSTRAINT "DoctorAvailability_doctorId_fkey"
FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
