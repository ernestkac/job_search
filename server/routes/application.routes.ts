import { Router } from "express";
import {
  getApplications,
  trackApplication,
  deleteApplication,
} from "../controller/application.controller";

const router = Router();

// GET /api/applications - List tracked job applications
router.get("/", getApplications);

// POST /api/applications - Create or update tracked application
router.post("/", trackApplication);

// DELETE /api/applications/:id - Remove tracked application
router.delete("/:id", deleteApplication);

export default router;
