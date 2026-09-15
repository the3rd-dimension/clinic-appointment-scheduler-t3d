import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { doctorId } = await params;

    if (!doctorId.trim()) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 },
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Failed to fetch doctor:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 },
    );
  }
}