import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  addComment,
  createQuestion,
  deleteComment,
  deleteQuestion,
  getQuestion,
  listQuestions,
  resolveQuestion,
} from "../controllers/question.controller";

const router = Router();

// Public read access — anyone (even unauthenticated visitors) can browse Q&A
router.get("/", listQuestions);
router.get("/:id", getQuestion);

// Pet owners post/manage questions
router.post("/", authenticate, authorize("PET_OWNER"), createQuestion);
router.patch("/:id/resolve", authenticate, authorize("PET_OWNER"), resolveQuestion);
router.delete("/:id", authenticate, authorize("PET_OWNER", "ADMIN"), deleteQuestion);

// Clinics answer via comments
router.post("/:id/comments", authenticate, authorize("CLINIC"), addComment);
router.delete("/:id/comments/:commentId", authenticate, authorize("CLINIC", "ADMIN"), deleteComment);

export default router;
