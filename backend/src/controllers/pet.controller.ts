import { Request, Response } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../config/db";
import { petOwners, pets } from "../db/schema";
import { ApiError } from "../utils/ApiError";

const petSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  ageYears: z.number().int().min(0).max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  notes: z.string().optional(),
});

async function getOwnerIdOrThrow(userId: string): Promise<string> {
  const owner = await db.query.petOwners.findFirst({ where: eq(petOwners.userId, userId) });
  if (!owner) throw ApiError.forbidden("Only pet owners can manage pets");
  return owner.id;
}

export async function listMyPets(req: Request, res: Response) {
  const ownerId = await getOwnerIdOrThrow(req.user!.sub);
  const rows = await db.query.pets.findMany({
    where: eq(pets.ownerId, ownerId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
  res.json({ pets: rows });
}

export async function createPet(req: Request, res: Response) {
  const ownerId = await getOwnerIdOrThrow(req.user!.sub);
  const data = petSchema.parse(req.body);
  const [pet] = await db.insert(pets).values({ ...data, ownerId }).returning();
  res.status(201).json({ pet });
}

export async function updatePet(req: Request, res: Response) {
  const ownerId = await getOwnerIdOrThrow(req.user!.sub);
  const { id } = req.params;
  const pet = await db.query.pets.findFirst({ where: eq(pets.id, id) });
  if (!pet || pet.ownerId !== ownerId) throw ApiError.notFound("Pet not found");

  const data = petSchema.partial().parse(req.body);
  const [updated] = await db
    .update(pets)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(pets.id, id), eq(pets.ownerId, ownerId)))
    .returning();

  res.json({ pet: updated });
}

export async function deletePet(req: Request, res: Response) {
  const ownerId = await getOwnerIdOrThrow(req.user!.sub);
  const { id } = req.params;
  const pet = await db.query.pets.findFirst({ where: eq(pets.id, id) });
  if (!pet || pet.ownerId !== ownerId) throw ApiError.notFound("Pet not found");

  await db.delete(pets).where(and(eq(pets.id, id), eq(pets.ownerId, ownerId)));
  res.json({ message: "Pet profile deleted" });
}
