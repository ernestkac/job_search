import { Router } from "express";
import {
  getProfile,
  updateProfile,
  parseCandidateCv,
  uploadCertificate,
  removeCertificate,
} from "../controller/candidate.controller";

const router = Router();

// GET /api/candidates - Fetch candidate profile
router.get("/", getProfile);

// POST /api/candidates - Save/update candidate profile
router.post("/", updateProfile);

// POST /api/candidates/parse-cv - Parse candidate CV and update profile
router.post("/parse-cv", parseCandidateCv);

// POST /api/candidates/certificates/upload - Save certificate file on server
router.post("/certificates/upload", uploadCertificate);

// DELETE /api/candidates/certificates/:certificateId - Remove a certificate file from storage
router.delete("/certificates/:certificateId", removeCertificate);

export default router;
