import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { createPet, deletePet, listMyPets, updatePet } from "../controllers/pet.controller";

const router = Router();

router.use(authenticate, authorize("PET_OWNER"));

router.get("/", listMyPets);
router.post("/", createPet);
router.patch("/:id", updatePet);
router.delete("/:id", deletePet);

export default router;
