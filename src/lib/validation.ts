import { z } from "zod";

export const bookingSchema = z.object({
  doctorId: z.string().min(1), patientName: z.string().trim().min(2).max(100),
  patientEmail: z.string().trim().email().max(200), startTime: z.coerce.date(), endTime: z.coerce.date(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMinute: z.number().int().min(0).max(1439),
  message: z.string().trim().min(2).max(500),
}).refine((value) => value.endTime > value.startTime, { message: "End time must be after start time", path: ["endTime"] });

export const doctorQuerySchema = z.object({ specialization: z.string().trim().max(80).optional() });