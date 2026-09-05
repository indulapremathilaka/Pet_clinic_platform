import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { clinics, petOwners, users } from "../db/schema";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";

const registerClinicSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2),
  registrationNo: z.string().optional(),
  phone: z.string().min(7),
  address: z.string().min(3),
  city: z.string().min(2),
  description: z.string().optional(),
});

const registerOwnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sanitizeUser(user: { id: string; email: string; role: string; isActive: boolean }) {
  return { id: user.id, email: user.email, role: user.role, isActive: user.isActive };
}

/**
 * A clinic self-registers, but does NOT get an active account yet.
 * The record is created with status = PENDING and only an Admin
 * approving it (see admin.controller) flips it to APPROVED.
 */
export async function registerClinic(req: Request, res: Response) {
  const data = registerClinicSchema.parse(req.body);

  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const clinic = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email: data.email, passwordHash, role: "CLINIC" })
      .returning();

    const [clinic] = await tx
      .insert(clinics)
      .values({
        userId: user.id,
        name: data.name,
        registrationNo: data.registrationNo,
        phone: data.phone,
        address: data.address,
        city: data.city,
        description: data.description,
        status: "PENDING",
      })
      .returning();

    return clinic;
  });

  res.status(201).json({
    message: "Registration request submitted. An administrator will review your clinic before you can log in.",
    clinic: { id: clinic.id, status: clinic.status },
  });
}

export async function registerPetOwner(req: Request, res: Response) {
  const data = registerOwnerSchema.parse(req.body);

  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const { user, petOwner } = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email: data.email, passwordHash, role: "PET_OWNER" })
      .returning();

    const [petOwner] = await tx
      .insert(petOwners)
      .values({ userId: user.id, fullName: data.fullName, phone: data.phone, address: data.address })
      .returning();

    return { user, petOwner };
  });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: sanitizeUser(user), petOwner });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
    with: { clinic: true, petOwner: true },
  });

  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated. Contact the administrator.");
  }

  if (user.role === "CLINIC" && user.clinic?.status !== "APPROVED") {
    const status = user.clinic?.status;
    if (status === "PENDING") {
      throw ApiError.forbidden("Your clinic registration is still pending admin approval.");
    }
    if (status === "REJECTED") {
      throw ApiError.forbidden(
        `Your clinic registration was rejected${user.clinic?.rejectionReason ? `: ${user.clinic.rejectionReason}` : "."}`
      );
    }
    throw ApiError.forbidden("Your clinic account is currently suspended.");
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.json({
    token,
    user: sanitizeUser(user),
    clinic: user.clinic ?? undefined,
    petOwner: user.petOwner ?? undefined,
  });
}

export async function me(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.sub),
    with: { clinic: true, petOwner: { with: { pets: true } } },
  });

  if (!user) throw ApiError.notFound("User not found");

  res.json({
    user: sanitizeUser(user),
    clinic: user.clinic ?? undefined,
    petOwner: user.petOwner ?? undefined,
  });
}
