import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const doctors = [
  { id: "dr-alexandra-chen", name: "Dr. Alexandra Chen", specialization: "Cardiology" },
  { id: "dr-marcus-wright", name: "Dr. Marcus Wright", specialization: "General medicine" },
  { id: "dr-leila-hassan", name: "Dr. Leila Hassan", specialization: "Dermatology" },
  { id: "dr-tamzid-idrish", name: "Tamzid Idrish", specialization: "Computer Health" },
];

async function main() {
  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: { name: doctor.name, specialization: doctor.specialization },
      create: doctor,
    });
  }

  await prisma.doctorAvailability.createMany({
    data: doctors.flatMap(({ id }) =>
      [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        doctorId: id,
        dayOfWeek,
        startMinute: 15 * 60,
        endMinute: 18 * 60,
      })),
    ),
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());