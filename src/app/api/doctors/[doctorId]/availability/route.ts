import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { doctorId } = await params;
    const date = new URL(request.url).searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { availability: { where: { dayOfWeek: dayStart.getUTCDay() } } },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 },
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: "SCHEDULED",
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: { startTime: true, endTime: true },
    });

    const slots = doctor.availability.flatMap((window) => {
      const availableSlots: { startTime: string; endTime: string; label: string; startMinute: number }[] = [];
      for (let minute = window.startMinute; minute + 45 <= window.endMinute; minute += 45) {
        const startTime = new Date(dayStart);
        startTime.setUTCMinutes(minute);
        const endTime = new Date(startTime);
        endTime.setUTCMinutes(minute + 45);
        const isBooked = appointments.some(
          (appointment) => appointment.startTime < endTime && appointment.endTime > startTime,
        );
        if (!isBooked) {
          availableSlots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            label: startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
            startMinute: minute,
          });
        }
      }
      return availableSlots;
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Failed to fetch doctor availability:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor availability" },
      { status: 500 },
    );
  }
}