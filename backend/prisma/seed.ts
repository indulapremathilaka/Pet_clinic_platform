import { PrismaClient, Role, ClinicStatus, QuestionCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@petclinic.lk";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: adminHash, role: Role.ADMIN },
  });
  console.log(`✔ Admin ready: ${adminEmail} / ${adminPassword}`);

  // Sample approved clinic
  const clinicPassword = await bcrypt.hash("Clinic@12345", 10);
  const clinicUser = await prisma.user.upsert({
    where: { email: "care@happypaws.lk" },
    update: {},
    create: {
      email: "care@happypaws.lk",
      passwordHash: clinicPassword,
      role: Role.CLINIC,
      clinic: {
        create: {
          name: "Happy Paws Veterinary Clinic",
          registrationNo: "VET-2024-0142",
          phone: "011-2345678",
          address: "45 Galle Road",
          city: "Colombo",
          description: "General veterinary care, vaccinations, and surgery for dogs and cats.",
          status: ClinicStatus.APPROVED,
        },
      },
    },
    include: { clinic: true },
  });
  console.log("✔ Sample approved clinic: care@happypaws.lk / Clinic@12345");

  // Sample pending clinic (for the admin to review)
  const pendingPassword = await bcrypt.hash("Clinic@12345", 10);
  await prisma.user.upsert({
    where: { email: "info@centralvet.lk" },
    update: {},
    create: {
      email: "info@centralvet.lk",
      passwordHash: pendingPassword,
      role: Role.CLINIC,
      clinic: {
        create: {
          name: "Central Veterinary Hospital",
          registrationNo: "VET-2024-0288",
          phone: "081-2233445",
          address: "12 Kandy Road",
          city: "Kandy",
          description: "24-hour emergency animal hospital.",
          status: ClinicStatus.PENDING,
        },
      },
    },
  });
  console.log("✔ Sample pending clinic request: info@centralvet.lk");

  // Sample pet owner with a pet and a question
  const ownerPassword = await bcrypt.hash("Owner@12345", 10);
  const owner = await prisma.user.upsert({
    where: { email: "nimal@example.com" },
    update: {},
    create: {
      email: "nimal@example.com",
      passwordHash: ownerPassword,
      role: Role.PET_OWNER,
      petOwner: {
        create: {
          fullName: "Nimal Perera",
          phone: "077-1234567",
          address: "Nugegoda",
          pets: {
            create: [{ name: "Kola", species: "Dog", breed: "Labrador", ageYears: 3, gender: "MALE" }],
          },
        },
      },
    },
    include: { petOwner: { include: { pets: true } } },
  });
  console.log("✔ Sample pet owner: nimal@example.com / Owner@12345");

  const pet = owner.petOwner?.pets[0];
  const existingQuestion = await prisma.question.findFirst({ where: { title: "Is it normal for my dog to skip a vaccine dose?" } });
  if (!existingQuestion && owner.petOwner) {
    const question = await prisma.question.create({
      data: {
        ownerId: owner.petOwner.id,
        petId: pet?.id,
        title: "Is it normal for my dog to skip a vaccine dose?",
        body: "My Labrador missed his scheduled rabies booster by two weeks due to travel. Should I restart the whole vaccination schedule or just continue from where we left off?",
        category: QuestionCategory.VACCINATION,
      },
    });

    if (clinicUser.clinic) {
      await prisma.comment.create({
        data: {
          questionId: question.id,
          clinicId: clinicUser.clinic.id,
          body: "A short delay of a couple of weeks is generally fine — please bring him in and we'll administer the booster and update his schedule. No need to restart from scratch in most cases.",
        },
      });
    }
    console.log("✔ Sample question with a clinic answer");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
