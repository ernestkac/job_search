import { Router } from "express";
import {
  getProfile,
  updateProfile,
  parseCandidateCv,
} from "../controller/candidate.controller";

const router = Router();

// GET /api/candidates - Fetch candidate profile
router.get("/", getProfile);

// POST /api/candidates - Save/update candidate profile
router.post("/", updateProfile);

// POST /api/candidates/parse-cv - Parse candidate CV and update profile
router.post("/parse-cv", parseCandidateCv);

export default router;
