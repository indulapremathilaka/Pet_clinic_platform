export type Role = "ADMIN" | "CLINIC" | "PET_OWNER";
export type ClinicStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type QuestionCategory = "VACCINATION" | "DISEASE" | "NUTRITION" | "BEHAVIOR" | "GROOMING" | "GENERAL";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Clinic {
  id: string;
  userId?: string;
  name: string;
  registrationNo?: string | null;
  phone: string;
  address: string;
  city: string;
  description?: string | null;
  status?: ClinicStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  user?: { id: string; email: string; isActive: boolean; createdAt: string };
}

export interface PetOwner {
  id: string;
  userId?: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  pets?: Pet[];
  questionCount?: number;
  user?: { id: string; email: string; isActive: boolean; createdAt: string };
}

export interface Pet {
  id: string;
  ownerId?: string;
  name: string;
  species: string;
  breed?: string | null;
  ageYears?: number | null;
  gender?: string | null;
  notes?: string | null;
}

export interface CommentItem {
  id: string;
  questionId?: string;
  clinicId?: string;
  body: string;
  createdAt: string;
  clinic?: { id: string; name: string; city: string };
  question?: { id: string; title: string; isResolved: boolean };
}

export interface QuestionItem {
  id: string;
  ownerId?: string;
  petId?: string | null;
  title: string;
  body: string;
  category: QuestionCategory;
  isResolved: boolean;
  createdAt: string;
  owner?: { id: string; fullName: string };
  pet?: { id: string; name: string; species: string } | null;
  comments: CommentItem[];
}

export interface DashboardStats {
  pendingClinics: number;
  approvedClinics: number;
  totalOwners: number;
  totalQuestions: number;
  unresolvedQuestions: number;
  totalComments: number;
  totalPets: number;
}
