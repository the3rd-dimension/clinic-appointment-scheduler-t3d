import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { doctorQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const parsedQuery = doctorQuerySchema.safeParse({
      specialization: url.searchParams.get("specialization") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.issues },
        { status: 400 },
      );
    }

    const { specialization } = parsedQuery.data;

    const rows = await prisma.doctor.findMany({
      where: specialization
        ? { specialization: { contains: specialization, mode: "insensitive" } }
        : undefined,
      include: {
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch doctors:", error);

    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 },
    );
  }
}