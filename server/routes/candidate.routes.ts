import { Router } from "express";
import {
  getProfile,
  updateProfile,
  parseCandidateCv,
} from "../controller/candidate.controller";

const router = Router();

// GET /api/profile - Fetch candidate profile
router.get("/", getProfile);

// POST /api/profile - Save/update candidate profile
router.post("/", updateProfile);

// POST /api/profile/parse-cv - Parse candidate CV and update profile
router.post("/parse-cv", parseCandidateCv);

export default router;
