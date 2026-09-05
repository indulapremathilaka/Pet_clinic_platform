import { Request, Response } from "express";
import { z } from "zod";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "../config/db";
import { clinics, comments } from "../db/schema";
import { ApiError } from "../utils/ApiError";

/** Public directory of approved clinics — visible to pet owners browsing the site. */
export async function listApprovedClinics(req: Request, res: Response) {
  const city = req.query.city as string | undefined;

  const rows = await db.query.clinics.findMany({
    where: city ? and(eq(clinics.status, "APPROVED"), ilike(clinics.city, city)) : eq(clinics.status, "APPROVED"),
    columns: {
      id: true,
      name: true,
      city: true,
      address: true,
      phone: true,
      description: true,
    },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  res.json({ clinics: rows });
}

export async function myClinicProfile(req: Request, res: Response) {
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.userId, req.user!.sub) });
  if (!clinic) throw ApiError.notFound("Clinic profile not found");
  res.json({ clinic });
}

const updateSchema = z.object({
  phone: z.string().min(7).optional(),
  address: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  description: z.string().optional(),
});

export async function updateMyClinicProfile(req: Request, res: Response) {
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.userId, req.user!.sub) });
  if (!clinic) throw ApiError.notFound("Clinic profile not found");

  const data = updateSchema.parse(req.body);
  const [updated] = await db
    .update(clinics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clinics.id, clinic.id))
    .returning();

  res.json({ clinic: updated });
}

export async function myAnsweredQuestions(req: Request, res: Response) {
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.userId, req.user!.sub) });
  if (!clinic) throw ApiError.notFound("Clinic profile not found");

  const rows = await db.query.comments.findMany({
    where: eq(comments.clinicId, clinic.id),
    with: { question: { columns: { id: true, title: true, isResolved: true } } },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  res.json({ comments: rows });
}
