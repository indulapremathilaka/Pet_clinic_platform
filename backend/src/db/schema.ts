import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["ADMIN", "CLINIC", "PET_OWNER"]);
export const clinicStatusEnum = pgEnum("clinic_status", ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]);
export const questionCategoryEnum = pgEnum("question_category", [
  "VACCINATION",
  "DISEASE",
  "NUTRITION",
  "BEHAVIOR",
  "GROOMING",
  "GENERAL",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  registrationNo: text("registration_no"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  status: clinicStatusEnum("status").notNull().default("PENDING"),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const petOwners = pgTable("pet_owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => petOwners.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  ageYears: integer("age_years"),
  gender: text("gender"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => petOwners.id, { onDelete: "cascade" }),
  petId: uuid("pet_id").references(() => pets.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: questionCategoryEnum("category").notNull().default("GENERAL"),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Relations (used by Drizzle's relational query API) ----

export const usersRelations = relations(users, ({ one }) => ({
  clinic: one(clinics, { fields: [users.id], references: [clinics.userId] }),
  petOwner: one(petOwners, { fields: [users.id], references: [petOwners.userId] }),
}));

export const clinicsRelations = relations(clinics, ({ one, many }) => ({
  user: one(users, { fields: [clinics.userId], references: [users.id] }),
  comments: many(comments),
}));

export const petOwnersRelations = relations(petOwners, ({ one, many }) => ({
  user: one(users, { fields: [petOwners.userId], references: [users.id] }),
  pets: many(pets),
  questions: many(questions),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(petOwners, { fields: [pets.ownerId], references: [petOwners.id] }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  owner: one(petOwners, { fields: [questions.ownerId], references: [petOwners.id] }),
  pet: one(pets, { fields: [questions.petId], references: [pets.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  question: one(questions, { fields: [comments.questionId], references: [questions.id] }),
  clinic: one(clinics, { fields: [comments.clinicId], references: [clinics.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Clinic = typeof clinics.$inferSelect;
export type NewClinic = typeof clinics.$inferInsert;
export type PetOwner = typeof petOwners.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];
export type ClinicStatus = (typeof clinicStatusEnum.enumValues)[number];
export type QuestionCategory = (typeof questionCategoryEnum.enumValues)[number];
