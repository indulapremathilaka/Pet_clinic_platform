import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  approveClinic,
  dashboardStats,
  deleteUser,
  listClinics,
  listPetOwners,
  rejectClinic,
  suspendClinic,
  toggleUserActive,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", dashboardStats);
router.get("/clinics", listClinics);
router.patch("/clinics/:id/approve", approveClinic);
router.patch("/clinics/:id/reject", rejectClinic);
router.patch("/clinics/:id/suspend", suspendClinic);
router.get("/pet-owners", listPetOwners);
router.patch("/users/:id/toggle-active", toggleUserActive);
router.delete("/users/:id", deleteUser);

export default router;
