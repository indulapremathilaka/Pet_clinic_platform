import { Request, Response } from "express";
import { z } from "zod";
import { count, eq } from "drizzle-orm";
import { db } from "../config/db";
import { clinics, comments, petOwners, pets, questions, users, ClinicStatus } from "../db/schema";
import { ApiError } from "../utils/ApiError";

/** List clinic registration requests, optionally filtered by status. Defaults to all. */
export async function listClinics(req: Request, res: Response) {
  const statusParam = (req.query.status as string | undefined)?.toUpperCase();
  const status = statusParam && statusParam !== "ALL" ? (statusParam as ClinicStatus) : undefined;

  const rows = await db.query.clinics.findMany({
    where: status ? eq(clinics.status, status) : undefined,
    with: { user: { columns: { id: true, email: true, isActive: true, createdAt: true } } },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  res.json({ clinics: rows });
}

export async function approveClinic(req: Request, res: Response) {
  const { id } = req.params;
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.id, id) });
  if (!clinic) throw ApiError.notFound("Clinic request not found");
  if (clinic.status === "APPROVED") throw ApiError.conflict("Clinic is already approved");

  const [updated] = await db
    .update(clinics)
    .set({ status: "APPROVED", reviewedBy: req.user!.sub, reviewedAt: new Date(), rejectionReason: null })
    .where(eq(clinics.id, id))
    .returning();

  res.json({ message: `${updated.name} has been approved and can now log in.`, clinic: updated });
}

const rejectSchema = z.object({
  reason: z.string().min(3).optional(),
});

export async function rejectClinic(req: Request, res: Response) {
  const { id } = req.params;
  const { reason } = rejectSchema.parse(req.body ?? {});

  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.id, id) });
  if (!clinic) throw ApiError.notFound("Clinic request not found");

  const [updated] = await db
    .update(clinics)
    .set({
      status: "REJECTED",
      reviewedBy: req.user!.sub,
      reviewedAt: new Date(),
      rejectionReason: reason ?? "Did not meet registration requirements",
    })
    .where(eq(clinics.id, id))
    .returning();

  res.json({ message: `${updated.name}'s request has been rejected.`, clinic: updated });
}

export async function suspendClinic(req: Request, res: Response) {
  const { id } = req.params;
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.id, id) });
  if (!clinic) throw ApiError.notFound("Clinic not found");

  const [updated] = await db
    .update(clinics)
    .set({ status: "SUSPENDED", reviewedBy: req.user!.sub, reviewedAt: new Date() })
    .where(eq(clinics.id, id))
    .returning();

  res.json({ message: `${updated.name} has been suspended.`, clinic: updated });
}

/** Admin can delete a clinic or pet owner account entirely. */
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "ADMIN") throw ApiError.forbidden("Admin accounts cannot be deleted this way");

  await db.delete(users).where(eq(users.id, id));
  res.json({ message: "Account and all associated data has been deleted." });
}

export async function listPetOwners(_req: Request, res: Response) {
  const owners = await db.query.petOwners.findMany({
    with: {
      user: { columns: { id: true, email: true, isActive: true, createdAt: true } },
      pets: true,
    },
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  });

  // attach a question count per owner
  const withCounts = await Promise.all(
    owners.map(async (owner) => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(questions)
        .where(eq(questions.ownerId, owner.id));
      return { ...owner, questionCount: value };
    })
  );

  res.json({ petOwners: withCounts });
}

export async function dashboardStats(_req: Request, res: Response) {
  const [pendingClinics] = await db.select({ value: count() }).from(clinics).where(eq(clinics.status, "PENDING"));
  const [approvedClinics] = await db.select({ value: count() }).from(clinics).where(eq(clinics.status, "APPROVED"));
  const [totalOwners] = await db.select({ value: count() }).from(petOwners);
  const [totalQuestions] = await db.select({ value: count() }).from(questions);
  const [unresolvedQuestions] = await db
    .select({ value: count() })
    .from(questions)
    .where(eq(questions.isResolved, false));
  const [totalComments] = await db.select({ value: count() }).from(comments);
  const [totalPets] = await db.select({ value: count() }).from(pets);

  res.json({
    pendingClinics: pendingClinics.value,
    approvedClinics: approvedClinics.value,
    totalOwners: totalOwners.value,
    totalQuestions: totalQuestions.value,
    unresolvedQuestions: unresolvedQuestions.value,
    totalComments: totalComments.value,
    totalPets: totalPets.value,
  });
}

export async function toggleUserActive(req: Request, res: Response) {
  const { id } = req.params;
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "ADMIN") throw ApiError.forbidden("Cannot deactivate an admin account");

  const [updated] = await db
    .update(users)
    .set({ isActive: !user.isActive })
    .where(eq(users.id, id))
    .returning();

  res.json({ message: `Account ${updated.isActive ? "activated" : "deactivated"}.`, isActive: updated.isActive });
}
