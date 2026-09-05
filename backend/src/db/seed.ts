import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./client";
import { clinics, comments, petOwners, pets, questions, users } from "./schema";

async function upsertUser(email: string, passwordHash: string, role: "ADMIN" | "CLINIC" | "PET_OWNER") {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing;
  const [created] = await db.insert(users).values({ email, passwordHash, role }).returning();
  return created;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@petclinic.lk";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await upsertUser(adminEmail, adminHash, "ADMIN");
  console.log(`Admin ready: ${adminEmail} / ${adminPassword}`);

  // Sample approved clinic
  const clinicHash = await bcrypt.hash("Clinic@12345", 10);
  let clinicUser = await db.query.users.findFirst({ where: eq(users.email, "care@happypaws.lk") });
  if (!clinicUser) {
    clinicUser = await upsertUser("care@happypaws.lk", clinicHash, "CLINIC");
    await db.insert(clinics).values({
      userId: clinicUser.id,
      name: "Happy Paws Veterinary Clinic",
      registrationNo: "VET-2024-0142",
      phone: "011-2345678",
      address: "45 Galle Road",
      city: "Colombo",
      description: "General veterinary care, vaccinations, and surgery for dogs and cats.",
      status: "APPROVED",
    });
  }
  console.log("Sample approved clinic: care@happypaws.lk / Clinic@12345");

  const clinicRecord = await db.query.clinics.findFirst({ where: eq(clinics.userId, clinicUser.id) });

  // Sample pending clinic (for the admin to review)
  const pendingHash = await bcrypt.hash("Clinic@12345", 10);
  const pendingUser = await db.query.users.findFirst({ where: eq(users.email, "info@centralvet.lk") });
  if (!pendingUser) {
    const created = await upsertUser("info@centralvet.lk", pendingHash, "CLINIC");
    await db.insert(clinics).values({
      userId: created.id,
      name: "Central Veterinary Hospital",
      registrationNo: "VET-2024-0288",
      phone: "081-2233445",
      address: "12 Kandy Road",
      city: "Kandy",
      description: "24-hour emergency animal hospital.",
      status: "PENDING",
    });
  }
  console.log("Sample pending clinic request: info@centralvet.lk");

  // Sample pet owner with a pet and a question
  const ownerHash = await bcrypt.hash("Owner@12345", 10);
  let ownerUser = await db.query.users.findFirst({ where: eq(users.email, "nimal@example.com") });
  let ownerRecord;
  if (!ownerUser) {
    ownerUser = await upsertUser("nimal@example.com", ownerHash, "PET_OWNER");
    [ownerRecord] = await db
      .insert(petOwners)
      .values({ userId: ownerUser.id, fullName: "Nimal Perera", phone: "077-1234567", address: "Nugegoda" })
      .returning();
  } else {
    ownerRecord = await db.query.petOwners.findFirst({ where: eq(petOwners.userId, ownerUser.id) });
  }
  console.log("Sample pet owner: nimal@example.com / Owner@12345");

  if (ownerRecord) {
    let pet = await db.query.pets.findFirst({ where: eq(pets.ownerId, ownerRecord.id) });
    if (!pet) {
      [pet] = await db
        .insert(pets)
        .values({ ownerId: ownerRecord.id, name: "Kola", species: "Dog", breed: "Labrador", ageYears: 3, gender: "MALE" })
        .returning();
    }

    const existingQuestion = await db.query.questions.findFirst({
      where: eq(questions.title, "Is it normal for my dog to skip a vaccine dose?"),
    });

    if (!existingQuestion) {
      const [question] = await db
        .insert(questions)
        .values({
          ownerId: ownerRecord.id,
          petId: pet.id,
          title: "Is it normal for my dog to skip a vaccine dose?",
          body: "My Labrador missed his scheduled rabies booster by two weeks due to travel. Should I restart the whole vaccination schedule or just continue from where we left off?",
          category: "VACCINATION",
        })
        .returning();

      if (clinicRecord) {
        await db.insert(comments).values({
          questionId: question.id,
          clinicId: clinicRecord.id,
          body: "A short delay of a couple of weeks is generally fine — please bring him in and we'll administer the booster and update his schedule. No need to restart from scratch in most cases.",
        });
      }
      console.log("Sample question with a clinic answer created");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
