import { Router } from "express";
import { login, me, registerClinic, registerPetOwner } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register/clinic", registerClinic);
router.post("/register/pet-owner", registerPetOwner);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
