import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  listApprovedClinics,
  myAnsweredQuestions,
  myClinicProfile,
  updateMyClinicProfile,
} from "../controllers/clinic.controller";

const router = Router();

router.get("/", listApprovedClinics);
router.get("/me", authenticate, authorize("CLINIC"), myClinicProfile);
router.patch("/me", authenticate, authorize("CLINIC"), updateMyClinicProfile);
router.get("/me/comments", authenticate, authorize("CLINIC"), myAnsweredQuestions);

export default router;
