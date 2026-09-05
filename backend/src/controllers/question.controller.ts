import { Request, Response } from "express";
import { z } from "zod";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../config/db";
import { clinics, comments, petOwners, pets, questions, QuestionCategory } from "../db/schema";
import { ApiError } from "../utils/ApiError";

const questionSchema = z.object({
  title: z.string().min(5).max(150),
  body: z.string().min(10),
  category: z.enum(["VACCINATION", "DISEASE", "NUTRITION", "BEHAVIOR", "GROOMING", "GENERAL"]).optional(),
  petId: z.string().uuid().optional(),
});

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
});

const questionWith = {
  owner: { columns: { id: true, fullName: true } },
  pet: { columns: { id: true, name: true, species: true } },
  comments: {
    with: { clinic: { columns: { id: true, name: true, city: true } } },
    orderBy: (c: any, { asc }: any) => [asc(c.createdAt)],
  },
};

export async function listQuestions(req: Request, res: Response) {
  const category = req.query.category as QuestionCategory | undefined;
  const resolved = req.query.resolved as string | undefined;
  const search = req.query.search as string | undefined;

  const conditions = [];
  if (category) conditions.push(eq(questions.category, category));
  if (resolved !== undefined) conditions.push(eq(questions.isResolved, resolved === "true"));
  if (search) conditions.push(or(ilike(questions.title, `%${search}%`), ilike(questions.body, `%${search}%`)));

  const rows = await db.query.questions.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: questionWith,
    orderBy: (q, { desc }) => [desc(q.createdAt)],
  });

  res.json({ questions: rows });
}

export async function getQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const question = await db.query.questions.findFirst({ where: eq(questions.id, id), with: questionWith });
  if (!question) throw ApiError.notFound("Question not found");
  res.json({ question });
}

export async function createQuestion(req: Request, res: Response) {
  const owner = await db.query.petOwners.findFirst({ where: eq(petOwners.userId, req.user!.sub) });
  if (!owner) throw ApiError.forbidden("Only pet owners can post questions");

  const data = questionSchema.parse(req.body);

  if (data.petId) {
    const pet = await db.query.pets.findFirst({ where: eq(pets.id, data.petId) });
    if (!pet || pet.ownerId !== owner.id) throw ApiError.badRequest("Invalid pet selected");
  }

  const [created] = await db
    .insert(questions)
    .values({ ...data, ownerId: owner.id })
    .returning();

  const question = await db.query.questions.findFirst({ where: eq(questions.id, created.id), with: questionWith });

  res.status(201).json({ question });
}

export async function resolveQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const owner = await db.query.petOwners.findFirst({ where: eq(petOwners.userId, req.user!.sub) });
  const question = await db.query.questions.findFirst({ where: eq(questions.id, id) });
  if (!question) throw ApiError.notFound("Question not found");
  if (!owner || question.ownerId !== owner.id) throw ApiError.forbidden("Only the author can mark this resolved");

  await db
    .update(questions)
    .set({ isResolved: !question.isResolved, updatedAt: new Date() })
    .where(eq(questions.id, id));

  const updated = await db.query.questions.findFirst({ where: eq(questions.id, id), with: questionWith });
  res.json({ question: updated });
}

export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const question = await db.query.questions.findFirst({ where: eq(questions.id, id) });
  if (!question) throw ApiError.notFound("Question not found");

  if (req.user!.role !== "ADMIN") {
    const owner = await db.query.petOwners.findFirst({ where: eq(petOwners.userId, req.user!.sub) });
    if (!owner || question.ownerId !== owner.id) throw ApiError.forbidden("You cannot delete this question");
  }

  await db.delete(questions).where(eq(questions.id, id));
  res.json({ message: "Question deleted" });
}

export async function addComment(req: Request, res: Response) {
  const clinic = await db.query.clinics.findFirst({ where: eq(clinics.userId, req.user!.sub) });
  if (!clinic) throw ApiError.forbidden("Only approved clinics can answer questions");
  if (clinic.status !== "APPROVED") throw ApiError.forbidden("Your clinic is not approved yet");

  const { id: questionId } = req.params;
  const question = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
  if (!question) throw ApiError.notFound("Question not found");

  const data = commentSchema.parse(req.body);

  const [created] = await db
    .insert(comments)
    .values({ body: data.body, questionId, clinicId: clinic.id })
    .returning();

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, created.id),
    with: { clinic: { columns: { id: true, name: true, city: true } } },
  });

  res.status(201).json({ comment });
}

export async function deleteComment(req: Request, res: Response) {
  const { commentId } = req.params;
  const comment = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
  if (!comment) throw ApiError.notFound("Comment not found");

  if (req.user!.role !== "ADMIN") {
    const clinic = await db.query.clinics.findFirst({ where: eq(clinics.userId, req.user!.sub) });
    if (!clinic || comment.clinicId !== clinic.id) throw ApiError.forbidden("You cannot delete this comment");
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  res.json({ message: "Comment deleted" });
}
